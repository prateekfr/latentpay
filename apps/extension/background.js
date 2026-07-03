// background.js - LatentPay MV3 service worker
//
// Owns the auth token, the auction-ad cache, every network call to the
// LatentPay backend, and the device-auth pairing/poll loop. content.js and
// popup.js never call fetch() or touch chrome.storage directly anymore —
// they message this worker instead. Two reasons this lives here rather than
// in the content script:
//
//  1. A content script's fetch() is subject to the HOST PAGE's CSP
//     (chatgpt.com/claude.ai/gemini.google.com could tighten connect-src at
//     any time and silently break ad loading / impression reporting). A
//     background worker's fetches aren't part of any page's context, so
//     they're immune to that.
//  2. The bearer token is a secret. Keeping it in chrome.storage.local,
//     read only by this worker, keeps it out of every page's storage
//     surface — content.js never even sees it.
//
// TODO(prod build step, Phase 5): API_BASE_URL becomes a build-time
// substitution instead of a literal once the extension has a real bundler
// step — see apps/ide/esbuild.mjs for the pattern this will follow.
const API_BASE_URL = "http://localhost:3000";
const AUCTION_SURFACE = "extension";

const DEVICE_POLL_ALARM = "latentpay-device-poll";
// Chrome enforces a minimum 1-minute period for chrome.alarms in packed
// extensions (shorter periods are only honored when loaded unpacked in dev
// mode) — this alarm is a durability backstop in case the worker gets torn
// down mid-signin, not the primary poll mechanism. The fast path is the
// setTimeout loop in pollDeviceAuthOnce()'s caller, which runs at the
// server-provided cadence while the worker is actively alive right after
// the user clicks "Sign in."
const DEVICE_POLL_ALARM_PERIOD_MINUTES = 1;

let currentAd = null;
let authToken = null;
let deviceAuthPollTimer = null;
// Cached locally so the popup can render instantly on open instead of
// blocking on a network round trip; refreshed from the server below.
let walletBalance = 0;
let earningsToday = 0;

// A message can arrive the instant a woken-up/newly-started worker starts
// executing, before this async storage read has resolved — every handler
// that touches authToken/walletBalance below awaits this first so it never
// acts on the pre-load defaults (null/0) instead of the real cached state.
const storageReady = new Promise((resolve) => {
  chrome.storage.local.get(["authToken", "walletBalance", "earningsToday"], (result) => {
    authToken = result.authToken || null;
    walletBalance = result.walletBalance || 0;
    earningsToday = result.earningsToday || 0;
    resolve();
  });
});

function cacheWalletState(nextBalance, nextEarningsToday) {
  walletBalance = nextBalance;
  earningsToday = nextEarningsToday;
  chrome.storage.local.set({ walletBalance, earningsToday });
}

/** Pulls the authoritative balance from the server — the source of truth,
 *  since payouts can also land from other linked devices (e.g. the IDE
 *  extension) that this worker never sees a SUBMIT_IMPRESSION for. */
function refreshWallet() {
  if (!authToken) return Promise.resolve();
  return fetch(`${API_BASE_URL}/api/v1/wallet/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) cacheWalletState(data.walletBalance, data.earningsToday);
    })
    .catch(() => {});
}

function refreshCurrentAd() {
  return fetch(`${API_BASE_URL}/api/v1/auction/${AUCTION_SURFACE}`)
    .then((res) => res.json())
    .then((data) => {
      const top = data && Array.isArray(data.campaigns) ? data.campaigns[0] : null;
      currentAd = top || null;
    })
    .catch(() => {
      currentAd = null;
    });
}

refreshCurrentAd();
chrome.alarms.create("latentpay-refresh-ad", { periodInMinutes: 1 });

function submitImpression(payload) {
  if (!authToken) {
    return Promise.resolve({ success: false, error: "Not signed in." });
  }
  return fetch(`${API_BASE_URL}/api/v1/impressions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  })
    .then((response) =>
      response.json().then((data) => {
        if (!response.ok) {
          throw new Error(data.error || "Failed to submit impression");
        }
        return data;
      }),
    )
    .then((data) => {
      // Reflect the payout instantly — no need to wait on the next
      // refreshWallet() round trip to show what the user just earned.
      cacheWalletState(data.data.walletBalance, earningsToday + (data.data.payoutAmount || 0));
      return { success: true, data: data.data };
    })
    .catch((error) => ({ success: false, error: error.message }));
}

// --- Device sign-in flow ---
// Approval happens in a normal browser tab (Clerk sign-in lives there
// already); this worker only starts the flow and polls for pickup.

function getPendingDeviceAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pendingDeviceAuth"], (result) => resolve(result.pendingDeviceAuth || null));
  });
}

function setPendingDeviceAuth(value) {
  return new Promise((resolve) => {
    if (value) {
      chrome.storage.local.set({ pendingDeviceAuth: value }, resolve);
    } else {
      chrome.storage.local.remove("pendingDeviceAuth", resolve);
    }
  });
}

function setAuthToken(token) {
  authToken = token;
  return new Promise((resolve) => {
    if (token) {
      chrome.storage.local.set({ authToken: token }, resolve);
    } else {
      chrome.storage.local.remove("authToken", resolve);
    }
  });
}

function startDeviceSignIn() {
  return fetch(`${API_BASE_URL}/api/v1/auth/device/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientKind: "extension" }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      await setPendingDeviceAuth({
        deviceCode: data.deviceCode,
        expiresAt: Date.now() + data.expiresInSeconds * 1000,
        pollIntervalMs: data.pollIntervalMs || 2000,
      });
      chrome.tabs.create({ url: data.verificationUrl });
      chrome.alarms.create(DEVICE_POLL_ALARM, { periodInMinutes: DEVICE_POLL_ALARM_PERIOD_MINUTES });
      startFastPollLoop(data.pollIntervalMs || 2000);
      return { success: true };
    })
    .catch((error) => ({ success: false, error: error.message }));
}

// Fast, best-effort polling for the common case: the worker is actively
// alive right after the user clicked "Sign in" and is likely to stay alive
// long enough to see the approval land within a few seconds. If the worker
// gets torn down before that (e.g. the user takes a while in the browser
// tab), the chrome.alarms backup above and the on-demand poll triggered by
// reopening the popup (see GET_AUTH_STATUS below) both still converge —
// this loop is a responsiveness optimization, not the correctness guarantee.
function startFastPollLoop(intervalMs) {
  if (deviceAuthPollTimer) clearTimeout(deviceAuthPollTimer);

  const tick = async () => {
    const resolved = await pollDeviceAuthOnce();
    if (resolved) return;
    const pending = await getPendingDeviceAuth();
    if (pending && pending.expiresAt > Date.now()) {
      deviceAuthPollTimer = setTimeout(tick, intervalMs);
    }
  };

  deviceAuthPollTimer = setTimeout(tick, intervalMs);
}

/** Polls once. Returns true if the flow resolved (approved or expired), false if still pending. */
async function pollDeviceAuthOnce() {
  const pending = await getPendingDeviceAuth();
  if (!pending) return true;

  if (pending.expiresAt <= Date.now()) {
    await setPendingDeviceAuth(null);
    chrome.alarms.clear(DEVICE_POLL_ALARM);
    return true;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/device/poll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceCode: pending.deviceCode }),
    });
    const data = await res.json();

    if (data.status === "approved" && data.token) {
      await setAuthToken(data.token);
      await setPendingDeviceAuth(null);
      chrome.alarms.clear(DEVICE_POLL_ALARM);
      return true;
    }
    if (data.status === "expired") {
      await setPendingDeviceAuth(null);
      chrome.alarms.clear(DEVICE_POLL_ALARM);
      return true;
    }
    return false; // still pending
  } catch {
    return false; // transient network error — keep trying
  }
}

function signOut() {
  const token = authToken;
  return setAuthToken(null).then(() => {
    if (!token) return { success: true };
    // Best-effort — sign-out succeeds locally regardless of whether the
    // revoke call reaches the server.
    return fetch(`${API_BASE_URL}/api/v1/auth/tokens/revoke`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .catch(() => {})
      .then(() => ({ success: true }));
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "latentpay-refresh-ad") {
    refreshCurrentAd();
    // Resyncs against the server on the same cadence, correcting any drift
    // from the additive local update in submitImpression() (e.g. balance
    // earned via another linked device) even while the popup stays closed.
    refreshWallet();
  } else if (alarm.name === DEVICE_POLL_ALARM) {
    pollDeviceAuthOnce();
  }
});

/** Abandons an in-flight device sign-in so the popup is never stuck showing
 *  "waiting for approval" with no way out (e.g. the user closed the tab, or
 *  approved the wrong account and wants to retry). The device code itself is
 *  simply left to expire server-side — nothing sensitive was ever handed to
 *  this client for a code that hasn't been approved. */
async function cancelSignIn() {
  if (deviceAuthPollTimer) {
    clearTimeout(deviceAuthPollTimer);
    deviceAuthPollTimer = null;
  }
  chrome.alarms.clear(DEVICE_POLL_ALARM);
  await setPendingDeviceAuth(null);
  return { success: true };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== "string") return false;

  switch (message.type) {
    case "GET_CURRENT_AD":
      sendResponse({ ad: currentAd });
      return false;

    case "SUBMIT_IMPRESSION":
      storageReady.then(() => submitImpression(message.payload)).then(sendResponse);
      return true; // async response

    case "GET_AUTH_STATUS":
      (async () => {
        await storageReady;
        let pending = await getPendingDeviceAuth();
        if (pending) {
          // Reopening (or polling) the popup is a natural moment to try an
          // immediate poll, covering the case where the fast loop already
          // died with the worker and the 1-minute alarm hasn't fired yet.
          // Must be awaited — responding with the pre-poll snapshot is what
          // used to make a same-tick approval look like it hadn't happened,
          // leaving the popup stuck one full cycle behind reality.
          await pollDeviceAuthOnce();
          pending = await getPendingDeviceAuth();
        }
        if (!pending && authToken) refreshWallet();
        sendResponse({ signedIn: !!authToken, pending: !!pending });
      })();
      return true;

    case "START_SIGN_IN":
      startDeviceSignIn().then(sendResponse);
      return true;

    case "CANCEL_SIGN_IN":
      cancelSignIn().then(sendResponse);
      return true;

    case "SIGN_OUT":
      storageReady
        .then(() => signOut())
        .then((result) => {
          cacheWalletState(0, 0);
          sendResponse(result);
        });
      return true;

    case "GET_WALLET_STATE":
      storageReady.then(() => sendResponse({ walletBalance, earningsToday }));
      return true;

    case "OPEN_DASHBOARD":
      chrome.tabs.create({ url: `${API_BASE_URL}/dashboard` });
      sendResponse({ success: true });
      return false;

    default:
      return false;
  }
});
