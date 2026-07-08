// popup.js - LatentPay popup UI
//
// No longer holds or accepts a raw user id — every request goes through
// the background service worker, which owns the bearer token entirely
// (see background.js). This file only renders sign-in/wallet state and
// relays button clicks as messages.

document.addEventListener("DOMContentLoaded", () => {
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");
  const pendingHint = document.getElementById("pendingHint");
  const signInBtn = document.getElementById("signInBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const errorMsg = document.getElementById("errorMsg");
  const walletCard = document.getElementById("walletCard");
  const walletBalanceEl = document.getElementById("walletBalance");
  const walletTodayEl = document.getElementById("walletToday");

  function show(el, visible) {
    el.style.display = visible ? "" : "none";
  }

  function formatUsd(value) {
    return `$${(Number(value) || 0).toFixed(4)}`;
  }

  function render(state) {
    errorMsg.textContent = "";

    if (state.signedIn) {
      statusDot.className = "status-dot signed-in";
      statusLabel.textContent = "Signed in";
      show(pendingHint, false);
      show(signInBtn, false);
      show(cancelBtn, false);
      show(walletCard, true);
      show(dashboardBtn, true);
      show(signOutBtn, true);
      refreshWallet();
    } else if (state.pending) {
      statusDot.className = "status-dot pending";
      statusLabel.textContent = "Waiting for browser approval…";
      show(pendingHint, true);
      show(signInBtn, false);
      show(cancelBtn, true);
      show(walletCard, false);
      show(dashboardBtn, false);
      show(signOutBtn, false);
    } else {
      statusDot.className = "status-dot signed-out";
      statusLabel.textContent = "Not signed in";
      show(pendingHint, false);
      show(signInBtn, true);
      signInBtn.disabled = false;
      show(cancelBtn, false);
      show(walletCard, false);
      show(dashboardBtn, false);
      show(signOutBtn, false);
    }
  }

  function refreshWallet() {
    chrome.runtime
      .sendMessage({ type: "GET_WALLET_STATE" })
      .then((state) => {
        if (!state) return;
        walletBalanceEl.textContent = formatUsd(state.walletBalance);
        walletTodayEl.textContent = `+${formatUsd(state.earningsToday)} today`;
      })
      .catch(() => {});
  }

  function refreshStatus() {
    chrome.runtime.sendMessage({ type: "GET_AUTH_STATUS" }).then(render).catch(() => {
      statusLabel.textContent = "Unable to reach extension background.";
    });
  }

  signInBtn.addEventListener("click", () => {
    signInBtn.disabled = true;
    statusLabel.textContent = "Opening sign-in page…";
    chrome.runtime
      .sendMessage({ type: "START_SIGN_IN" })
      .then((response) => {
        if (!response || !response.success) {
          errorMsg.textContent = (response && response.error) || "Could not start sign-in.";
          signInBtn.disabled = false;
          return;
        }
        render({ signedIn: false, pending: true });
      })
      .catch(() => {
        errorMsg.textContent = "Could not reach extension background.";
        signInBtn.disabled = false;
      });
  });

  cancelBtn.addEventListener("click", () => {
    cancelBtn.disabled = true;
    chrome.runtime.sendMessage({ type: "CANCEL_SIGN_IN" }).then(() => {
      cancelBtn.disabled = false;
      refreshStatus();
    });
  });

  dashboardBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD" });
  });

  signOutBtn.addEventListener("click", () => {
    signOutBtn.disabled = true;
    chrome.runtime.sendMessage({ type: "SIGN_OUT" }).then(() => {
      signOutBtn.disabled = false;
      refreshStatus();
    });
  });

  refreshStatus();
  // Catches the case where the user approved sign-in in another tab while
  // this popup was already open and waiting, and keeps the wallet balance
  // live while a generation is actively earning.
  const pollInterval = setInterval(refreshStatus, 2000);
  window.addEventListener("unload", () => clearInterval(pollInterval));
});
