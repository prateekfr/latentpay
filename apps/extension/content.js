// content.js - LatentPay Chrome Extension Content Script

(function () {
  let isGenerating = false;
  let startTime = 0;
  let activeBanner = null;
  let activeBannerTarget = null;
  let tickerInterval = null;
  let hasMetThreshold = false;

  // The real, currently-winning ad for this surface (from the auction
  // endpoint) — null when no advertiser is currently serving. Refreshed
  // periodically in the background so it's ready the instant a generation
  // starts, rather than fetching (and racing) at start time.
  let currentAd = null;
  // Snapshot of `currentAd` taken at the moment a generation started, so the
  // impression billed on stop always matches what was actually displayed.
  let activeAdForImpression = null;

  // The background service worker owns the actual network call (and its own
  // 1-minute refresh cadence) — this just asks for whatever it currently has
  // cached, so multiple tabs share one fetch instead of each polling the
  // network independently, and so the request isn't subject to this page's
  // CSP (see background.js's header comment for why that matters).
  function refreshCurrentAd() {
    chrome.runtime
      .sendMessage({ type: "GET_CURRENT_AD" })
      .then((response) => {
        currentAd = (response && response.ad) || null;
      })
      .catch(() => {
        currentAd = null;
      });
  }

  refreshCurrentAd();
  setInterval(refreshCurrentAd, 30000);

  // Claude text change tracking state
  let lastClaudeText = "";
  let lastClaudeTextTime = 0;
  let claudeStreamingActive = false;

  // Helper to retrieve text of the last assistant message
  function getLastAssistantMessageText() {
    const selector =
      '.font-claude-message, [data-message-author-role="assistant"], .chat-turn, .message-content';
    const elements = Array.from(document.querySelectorAll(selector)).filter(
      (el) => {
        // Exclude elements that are inside the input composer or contenteditable to avoid matching user typing
        return (
          !el.closest("form") &&
          !el.closest("fieldset") &&
          !el.closest('[contenteditable="true"]')
        );
      },
    );

    if (elements.length > 0) {
      return elements[elements.length - 1].innerText || "";
    }
    return "";
  }

  // Initialize the Isolated Glass Pane Root at document.documentElement
  let root = document.getElementById("latentpay-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "latentpay-root";
    root.style.position = "fixed";
    root.style.bottom = "0";
    root.style.left = "0";
    root.style.width = "100vw";
    root.style.height = "100vh";
    root.style.pointerEvents = "none";
    root.style.zIndex = "2147483647";
    root.style.display = "flex";
    root.style.justifyContent = "center"; // Perfectly center elements horizontally
    root.style.alignItems = "flex-end"; // Snap elements to the bottom zone
    document.documentElement.appendChild(root);
    console.log("[LatentPay] Isolated Glass Pane root initialized.");
  }

  // Helper to detect current LLM platform
  function getPlatform() {
    const hostname = window.location.hostname;
    if (
      hostname.includes("chatgpt.com") ||
      hostname.includes("chat.openai.com")
    ) {
      return "chatgpt";
    }
    if (hostname.includes("claude.ai")) {
      return "claude";
    }
    if (hostname.includes("gemini.google.com")) {
      return "gemini";
    }
    return "unknown";
  }

  // Helper to locate the active Stop button
  function findStopButton() {
    const platform = getPlatform();

    if (platform === "chatgpt") {
      return document.querySelector('button[data-testid="stop-button"]');
    }

    if (platform === "claude") {
      const stopBtn = document.querySelector(
        'button[aria-label*="stop" i], button[aria-label*="cancel" i]',
      );
      if (stopBtn) {
        const isDisabled =
          stopBtn.disabled || stopBtn.getAttribute("aria-disabled") === "true";
        if (!isDisabled) return stopBtn;
      }

      // Check test-ids or class lists for stops/cancels as a fallback
      return (
        Array.from(document.querySelectorAll("button")).find((btn) => {
          const ariaLabel = (
            btn.getAttribute("aria-label") || ""
          ).toLowerCase();
          const testId = (btn.getAttribute("data-testid") || "").toLowerCase();
          const isDisabled =
            btn.disabled || btn.getAttribute("aria-disabled") === "true";

          const isStopLabel =
            ariaLabel.includes("stop") ||
            ariaLabel.includes("cancel") ||
            testId.includes("stop");

          return isStopLabel && !isDisabled;
        }) || null
      );
    }

    if (platform === "gemini") {
      return (
        Array.from(document.querySelectorAll("button")).find((btn) => {
          const ariaLabel = (
            btn.getAttribute("aria-label") || ""
          ).toLowerCase();
          const tooltip = (btn.getAttribute("tooltip") || "").toLowerCase();
          const title = (btn.getAttribute("title") || "").toLowerCase();
          return (
            ariaLabel.includes("stop") ||
            ariaLabel.includes("cancel") ||
            tooltip.includes("stop") ||
            title.includes("stop") ||
            btn.querySelector("mat-progress-bar") ||
            btn.querySelector("svg rect")
          );
        }) || null
      );
    }

    // Generic fallback for unknown platforms
    const dataTestIdBtn = document.querySelector(
      'button[data-testid="stop-button"]',
    );
    if (dataTestIdBtn) return dataTestIdBtn;

    const stopButtons = Array.from(document.querySelectorAll("button")).filter(
      (btn) => {
        const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();
        const title = (btn.getAttribute("title") || "").toLowerCase();
        return (
          ariaLabel.includes("stop generating") ||
          ariaLabel.includes("stop streaming") ||
          ariaLabel.includes("stop generation") ||
          ariaLabel.includes("interrupt") ||
          ariaLabel.includes("cancel generation") ||
          ariaLabel === "stop" ||
          title.includes("stop") ||
          title.includes("interrupt")
        );
      },
    );
    if (stopButtons.length > 0) return stopButtons[0];

    const svgStopButtons = Array.from(
      document.querySelectorAll("button"),
    ).filter((btn) => {
      const rect = btn.querySelector("svg rect");
      if (rect) {
        const width = parseFloat(rect.getAttribute("width") || "0");
        const height = parseFloat(rect.getAttribute("height") || "0");
        if (width > 0 && height > 0) {
          return true;
        }
      }
      return false;
    });
    if (svgStopButtons.length > 0) return svgStopButtons[0];

    return null;
  }

  // Utility to check if generating an answer across ChatGPT, Claude, or Gemini
  function checkStopButtonExists() {
    const platform = getPlatform();

    if (platform === "chatgpt") {
      if (document.querySelector('button[data-testid="stop-button"]'))
        return true;
      if (document.querySelector(".result-streaming")) return true;
      return false;
    }

    if (platform === "claude") {
      const stopBtn = findStopButton();
      const hasStop = !!stopBtn;
      const hasStreamingClass =
        !!document.querySelector(".is-streaming") ||
        !!document.querySelector(".streaming") ||
        !!document.querySelector('[data-testid="streaming-message"]');

      const fieldset = document.querySelector("fieldset");
      const isInputLocked = !!(fieldset && fieldset.hasAttribute("disabled"));

      if (hasStop || hasStreamingClass || isInputLocked) {
        const currentText = getLastAssistantMessageText();
        if (currentText) {
          lastClaudeText = currentText;
          lastClaudeTextTime = Date.now();
        }
        return true;
      }

      const now = Date.now();
      const currentText = getLastAssistantMessageText();

      if (currentText && currentText !== lastClaudeText) {
        lastClaudeText = currentText;
        lastClaudeTextTime = now;
        claudeStreamingActive = true;
      } else {
        claudeStreamingActive = false;
      }
      return claudeStreamingActive;
    }

    if (platform === "gemini") {
      if (document.querySelector("mat-progress-bar")) return true;
      if (document.querySelector(".generating")) return true;
      if (document.querySelector(".streaming-text")) return true;
      if (
        document.querySelector("div[role='progressbar']") ||
        document.querySelector(".progress-indicator")
      ) {
        return true;
      }

      const stopBtn = Array.from(document.querySelectorAll("button")).find(
        (btn) => {
          const ariaLabel = (
            btn.getAttribute("aria-label") || ""
          ).toLowerCase();
          return ariaLabel.includes("stop") || ariaLabel.includes("cancel");
        },
      );
      if (stopBtn && stopBtn.offsetWidth > 0 && stopBtn.offsetHeight > 0) {
        return true;
      }

      return false;
    }

    // Fallback checks
    if (findStopButton()) return true;

    if (
      document.querySelector(".result-streaming") ||
      document.querySelector(".is-streaming") ||
      document.querySelector(".streaming-text") ||
      document.querySelector("div.generating") ||
      document.querySelector("mat-progress-bar")
    ) {
      return true;
    }

    return false;
  }

  // Find the form/composer wrapper container containing the prompt input box
  function findComposerOrForm() {
    const platform = getPlatform();

    if (platform === "chatgpt") {
      const prompt = document.getElementById("prompt");
      if (prompt) {
        const form = prompt.closest("form");
        if (form) return form;

        const composer =
          prompt.closest('[data-testid="composer-root"]') ||
          prompt.closest(".composer-parent");
        if (composer) return composer;

        return prompt.parentElement;
      }

      const formElement = document.querySelector("form");
      if (formElement) return formElement;

      const composerRoot = document.querySelector(
        '[data-testid="composer-root"]',
      );
      if (composerRoot) return composerRoot;
    }

    if (platform === "claude") {
      const editor =
        document.querySelector("div.ProseMirror") ||
        document.querySelector('[contenteditable="true"]');
      if (editor) {
        const fieldset = editor.closest("fieldset");
        if (fieldset) return fieldset;

        const container =
          editor.closest(".flex.flex-col") || editor.parentElement;
        return container;
      }
    }

    if (platform === "gemini") {
      const editor =
        document.querySelector("div.rich-textarea") ||
        document.querySelector("textarea") ||
        document.querySelector('[contenteditable="true"]');
      if (editor) {
        const container =
          editor.closest(".input-area-container") ||
          editor.closest(".chat-input-container") ||
          editor.closest(".input-area") ||
          editor.closest("form") ||
          editor.parentElement;
        return container;
      }
    }

    // Generic fallback checks across all platforms
    const prompt = document.getElementById("prompt");
    if (prompt) {
      const form = prompt.closest("form");
      if (form) return form;

      const composer =
        prompt.closest('[data-testid="composer-root"]') ||
        prompt.closest(".composer-parent");
      if (composer) return composer;

      return prompt.parentElement;
    }

    const editor =
      document.querySelector("div.ProseMirror") ||
      document.querySelector("div.rich-textarea") ||
      document.querySelector('[contenteditable="true"]') ||
      document.querySelector("textarea");

    if (editor) {
      const form = editor.closest("form") || editor.closest("fieldset");
      if (form) return form;

      const composer =
        editor.closest('[data-testid="composer-root"]') ||
        editor.closest(".composer-parent") ||
        editor.closest(".input-area-container") ||
        editor.closest(".chat-input-container") ||
        editor.closest(".input-area");
      if (composer) return composer;

      return editor.parentElement;
    }

    const formElement = document.querySelector("form");
    if (formElement) return formElement;

    const composerRoot =
      document.querySelector('[data-testid="composer-root"]') ||
      document.querySelector(".composer-parent") ||
      document.querySelector("div.w-full.max-w-3xl") ||
      document.querySelector(".input-area-container") ||
      document.querySelector(".chat-input-container");
    if (composerRoot) return composerRoot;

    return null;
  }

  // Dynamically update the Glass Pane Root bounds to match the prompt input composer
  function updateRootBounds() {
    const paneRoot = document.getElementById("latentpay-root");
    if (!paneRoot) return;

    const composer = findComposerOrForm();
    if (composer) {
      const rect = composer.getBoundingClientRect();
      if (rect.width > 0) {
        paneRoot.style.position = "fixed";
        paneRoot.style.left = `${rect.left}px`;
        paneRoot.style.width = `${rect.width}px`;
        paneRoot.style.bottom = "0";
        paneRoot.style.height = "100vh";
        return;
      }
    }

    // Fallback: Full screen bounds
    paneRoot.style.position = "fixed";
    paneRoot.style.bottom = "0";
    paneRoot.style.left = "0";
    paneRoot.style.width = "100vw";
    paneRoot.style.height = "100vh";
  }

  // Find the target container for appending the banner (the glass pane root)
  function findLatestAssistantTurnContent() {
    let paneRoot = document.getElementById("latentpay-root");
    if (!paneRoot) {
      paneRoot = document.createElement("div");
      paneRoot.id = "latentpay-root";
      paneRoot.style.position = "fixed";
      paneRoot.style.bottom = "0";
      paneRoot.style.left = "0";
      paneRoot.style.width = "100vw";
      paneRoot.style.height = "100vh";
      paneRoot.style.pointerEvents = "none";
      paneRoot.style.zIndex = "2147483647";
      paneRoot.style.display = "flex";
      paneRoot.style.justifyContent = "center"; // Perfectly center elements horizontally
      paneRoot.style.alignItems = "flex-end"; // Snap elements to the bottom zone
      document.documentElement.appendChild(paneRoot);
      console.log(
        "[LatentPay] Isolated Glass Pane root re-initialized during anchor lookup.",
      );
    }
    return paneRoot;
  }

  // Create and configure the sleek Shadow DOM sponsor banner element
  function createSponsorBanner(ad) {
    const banner = document.createElement("latentpay-banner");
    const shadow = banner.attachShadow({ mode: "open" });

    // Detect dark theme context
    const isDark =
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    banner.classList.toggle("dark-theme", isDark);

    // Write Shadow DOM styles for absolute separation and maximum visual fidelity
    const style = document.createElement("style");
    style.textContent = `
      :host {
        --bg-color: rgba(255, 255, 255, 0.72);
        --border-color: rgba(107, 33, 168, 0.12);
        --text-color: #1f2937;
        --text-muted: #6b7280;
        --accent-gradient: linear-gradient(135deg, #c084fc, #9333ea 55%, #6b21a8);
        --progress-bg: rgba(0, 0, 0, 0.08);
        --card-shadow: 0 20px 50px -20px rgba(107, 33, 168, 0.35), 0 2px 8px rgba(0, 0, 0, 0.06);
        --success-color: #10b981;
        --success-bg: rgba(16, 185, 129, 0.08);
        --success-border: rgba(16, 185, 129, 0.2);
        --dot-color: #ef4444;
        --dot-bg: rgba(239, 68, 68, 0.1);
        --dot-border: rgba(239, 68, 68, 0.2);

        display: block;
        width: 100%;
        max-width: 768px; /* Matches ChatGPT's text column width perfectly */
        margin-bottom: 120px; /* Positions it safely right above the input box */
        padding: 0 16px; /* Prevents edge-clipping on smaller viewports */
        pointer-events: none; /* Allows clicks to pass through wrapper container */
        box-sizing: border-box;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      :host(.dark-theme) {
        --bg-color: rgba(19, 19, 21, 0.72);
        --border-color: rgba(223, 183, 255, 0.14);
        --text-color: #ece6f0;
        --text-muted: #a99fc2;
        --accent-gradient: linear-gradient(135deg, #dfb7ff, #a855f7 55%, #6b21a8);
        --progress-bg: rgba(255, 255, 255, 0.08);
        --card-shadow: 0 20px 50px -20px rgba(168, 85, 247, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3);
        --dot-color: #f38ba8;
        --dot-bg: rgba(243, 139, 168, 0.1);
        --dot-border: rgba(243, 139, 168, 0.2);
      }

      .banner-card {
        background: var(--bg-color);
        backdrop-filter: blur(20px) saturate(150%);
        -webkit-backdrop-filter: blur(20px) saturate(150%);
        border: 1px solid var(--border-color);
        border-radius: 14px;
        box-shadow: var(--card-shadow);
        padding: 14px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        gap: 16px;
        pointer-events: auto; /* Allow clicks on the ad card content */
      }

      .banner-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--accent-gradient);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 800;
        font-size: 16px;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
        animation: logo-glowing 2s infinite ease-in-out;
      }

      .info-text {
        display: flex;
        flex-col: column;
        gap: 2px;
      }

      .sponsor-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .sponsor-msg {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color);
        margin: 0;
      }

      .status-container {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .status-pill.pending {
        background: var(--dot-bg);
        color: var(--dot-color);
        border: 1px solid var(--dot-border);
      }

      .status-pill.success {
        background: var(--success-bg);
        color: var(--success-color);
        border: 1px solid var(--success-border);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
        animation: scale-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: currentColor;
        animation: pulse-animation 1.5s infinite ease-in-out;
      }

      .checkmark-icon {
        width: 14px;
        height: 14px;
        fill: none;
        stroke: currentColor;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .progress-bar-container {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: var(--progress-bg);
      }

      .progress-bar-fill {
        height: 100%;
        width: 0%;
        background: var(--accent-gradient);
        transition: width 0.1s linear, background-color 0.3s ease;
      }

      .progress-bar-fill.finished {
        background: var(--success-color);
      }

      /* Animations */
      @keyframes pulse-animation {
        0% { transform: scale(0.8); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(0.8); opacity: 0.5; }
      }

      @keyframes logo-glowing {
        0% { filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.25)); }
        50% { filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.65)); }
        100% { filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.25)); }
      }

      @keyframes scale-up {
        0% { transform: scale(0.8); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;

    const card = document.createElement("div");
    card.className = "banner-card";

    const title = ad && ad.companyName ? escapeHtml(ad.companyName) : "Sponsored by LatentPay";
    const message = ad && ad.adLine ? escapeHtml(ad.adLine) : "Supporting free queries. View rewards active.";
    const logoHtml =
      ad && ad.brandIconUrl
        ? `<img src="${escapeHtml(ad.brandIconUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`
        : `<svg viewBox="0 0 90 130" style="width:58%;height:58%;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><polygon points="0,0 35.2,0 80,60 35.2,120 0,120 44.8,60" fill="#f5f3ee"/></svg>`;

    card.innerHTML = `
      <div class="banner-left">
        <div class="logo-icon">${logoHtml}</div>
        <div class="info-text">
          <div class="sponsor-title">${title}</div>
          <div class="sponsor-msg">${message}</div>
        </div>
      </div>
      <div class="status-container">
        <div class="status-pill pending">
          <div class="pulse-dot"></div>
          <span class="status-label">View 5.0s</span>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill"></div>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(card);

    return banner;
  }

  // Advertiser-supplied fields (adLine, companyName) are rendered via
  // innerHTML above — escape before interpolating to prevent a malicious
  // campaign from injecting markup/script into the page.
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }

  // Update the progress UI inside the banner Shadow DOM
  function updateBannerProgress(banner, elapsed) {
    if (!banner || !banner.shadowRoot) return;

    const fill = banner.shadowRoot.querySelector(".progress-bar-fill");
    const pill = banner.shadowRoot.querySelector(".status-pill");
    const label = banner.shadowRoot.querySelector(".status-label");

    if (!fill || !pill || !label) return;

    // Cap the progress width calculation at 100% for the 5-second target
    const percent = Math.min((elapsed / 5.0) * 100, 100);
    fill.style.width = `${percent}%`;

    if (elapsed >= 5.0 && !hasMetThreshold) {
      hasMetThreshold = true;

      // Transition visual style to active success reward state
      pill.className = "status-pill success";
      pill.innerHTML = `
        <svg class="checkmark-icon" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>+0.01 LP Earned</span>
      `;
      fill.classList.add("finished");

      console.log(
        "[LatentPay] Reward threshold hit! Visual completion triggered.",
      );
    } else if (elapsed < 5.0) {
      const remaining = Math.max(5.0 - elapsed, 0).toFixed(1);
      label.textContent = `View ${remaining}s`;
    }
  }

  let tracerObserver = null;

  // Set up MutationObserver to trace when React unmounts our banner element
  function setupTracerObserver() {
    if (tracerObserver) return;

    tracerObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.removedNodes && mutation.removedNodes.length > 0) {
          for (const node of mutation.removedNodes) {
            if (
              node.tagName === "LATENTPAY-BANNER" ||
              node.nodeName === "LATENTPAY-BANNER"
            ) {
              console.warn(
                "[LatentPay FATAL] Banner was unmounted by React! Parent node at time of death was:",
                mutation.target,
              );
            }
          }
        }
      }
    });

    tracerObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    console.log("[LatentPay] Tracer MutationObserver initialized.");
  }

  // Inject banner as the last child of the outer conversation-turn wrapper block
  function injectBanner(target, banner) {
    if (!target || !banner) return;
    target.appendChild(banner);
  }

  // Trigger active generation setup, injection, and start timer
  function startGeneration() {
    isGenerating = true;
    startTime = Date.now();
    hasMetThreshold = false;

    console.log("[LatentPay] Active generation start detected.");

    // Nothing is currently winning this surface's auction — don't show a
    // banner (and don't bill an impression) for an ad that isn't real.
    if (!currentAd) {
      console.log("[LatentPay] No live campaign for this surface; skipping banner.");
      activeAdForImpression = null;
      return;
    }
    activeAdForImpression = currentAd;

    // Idempotency cleanup: remove any existing banner to avoid duplicates
    const existing = document.querySelector("latentpay-banner");
    if (existing) {
      existing.remove();
      console.log(
        "[LatentPay] Cleaned up existing duplicate banner before injection.",
      );
    }

    // Look for target and inject banner
    const target = findLatestAssistantTurnContent();
    if (target) {
      activeBannerTarget = target;
      activeBanner = createSponsorBanner(activeAdForImpression);
      injectBanner(target, activeBanner);

      // Adjust root bounds immediately to center the banner
      updateRootBounds();

      // Trigger standard entrance fade-in transition
      requestAnimationFrame(() => {
        if (activeBanner) {
          activeBanner.style.opacity = "1";
          activeBanner.style.transform = "translateY(0)";
        }
      });

      // Ticker to update progress and root bounds every 100ms
      tickerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        updateBannerProgress(activeBanner, elapsed);
        updateRootBounds();
      }, 100);
    } else {
      console.warn(
        "[LatentPay] Could not find assistant message content element to inject banner.",
      );
    }
  }

  // Stop generation, handle duration validation, and trigger clean removal animation
  function stopGeneration() {
    // Immediate Click-Through Liberation: Disable pointer-events and clear inner HTML on our glass pane root instantly
    const root = document.getElementById("latentpay-root");
    if (root) {
      root.style.pointerEvents = "none";
      root.innerHTML = "";
    }

    isGenerating = false;
    if (tickerInterval) {
      clearInterval(tickerInterval);
      tickerInterval = null;
    }

    const endTime = Date.now();
    const duration = startTime > 0 ? (endTime - startTime) / 1000 : 0;

    console.log(
      `[LatentPay] Generation completed. Duration: ${duration.toFixed(2)}s`,
    );

    // If duration is at least 5 seconds AND a real ad was actually shown,
    // submit the real ingestion payload against that campaign. The
    // background worker attaches the bearer token — this content script
    // never touches auth at all, only the ad/duration data.
    if (duration >= 5.0 && activeAdForImpression) {
      const payload = {
        campaignId: activeAdForImpression.id,
        durationSeconds: parseFloat(duration.toFixed(2)),
        kind: "view",
        // One id per real generation-stop event, so a retried/duplicated
        // message to the background worker can't double-credit the payout.
        eventId: crypto.randomUUID(),
      };

      console.log("[LatentPay] Submitting Impression Payload:", payload);

      chrome.runtime
        .sendMessage({ type: "SUBMIT_IMPRESSION", payload })
        .then((response) => {
          if (!response || !response.success) {
            throw new Error((response && response.error) || "Failed to submit impression");
          }
          console.log(
            `[LatentPay] Payout transaction successful! Wallet balance: ${response.data.walletBalance}`,
            response,
          );
        })
        .catch((error) => {
          console.error(
            "[LatentPay] Failed to send impression to ingestion server:",
            error,
          );
        });
    } else {
      console.log(
        `[LatentPay] Impression duration (${duration.toFixed(2)}s) under 5s payout threshold. Not submitted.`,
      );
    }

    // Disconnect the watchdog observer before intentional removal
    if (tracerObserver) {
      tracerObserver.disconnect();
      tracerObserver = null;
      console.log(
        "[LatentPay] Watchdog observer disconnected for clean removal.",
      );
    }

    // Reset root to full-screen
    const paneRoot = document.getElementById("latentpay-root");
    if (paneRoot) {
      paneRoot.style.left = "0";
      paneRoot.style.width = "100vw";
    }

    activeBanner = null;
    activeBannerTarget = null;
    activeAdForImpression = null;
    startTime = 0;

    // Reset all tracking and streaming variables cleanly
    hasMetThreshold = false;
    lastClaudeText = "";
    lastClaudeTextTime = 0;
    claudeStreamingActive = false;
  }

  // Robust monitoring loop checking state transitions
  function monitorState() {
    // Bulletproof Gemini Abort Detection:
    // If the current platform is gemini and isGenerating is true,
    // verify if native progress bar and stop button have vanished.
    if (getPlatform() === "gemini" && isGenerating) {
      const hasProgressBar = !!document.querySelector(
        "mat-progress-bar, div[role='progressbar'], .progress-indicator, .generating, .streaming-text",
      );
      const stopBtn = findStopButton();
      const isStopBtnVisible = !!(
        stopBtn &&
        stopBtn.offsetWidth > 0 &&
        stopBtn.offsetHeight > 0
      );

      if (!hasProgressBar && !isStopBtnVisible) {
        console.log(
          "[LatentPay Debug] Gemini generation aborted or finished (Progress bar and Stop button vanished). Triggering immediate stop.",
        );
        stopGeneration();
        return;
      }
    }

    const isGeneratingNow = checkStopButtonExists();

    // Verbose Claude Logging
    if (getPlatform() === "claude") {
      const stopBtn = findStopButton();
      const fieldset = document.querySelector("fieldset");
      const isInputLocked = !!(fieldset && fieldset.hasAttribute("disabled"));
      console.log(
        "[LatentPay Debug] Claude State - StopBtn found:",
        !!stopBtn,
        "Input Locked:",
        !!isInputLocked,
      );
    }

    if (isGeneratingNow && !isGenerating) {
      // Initialize observer tracking when active generation starts
      setupTracerObserver();
      startGeneration();
    } else if (!isGeneratingNow && isGenerating) {
      console.log(
        "[LatentPay] Generation stopped, aborted manually, or completed.",
      );
      stopGeneration();
    } else if (isGenerating && activeAdForImpression) {
      // Check if the banner exists anywhere in the active DOM tree
      const banner = document.querySelector("latentpay-banner");

      if (!banner) {
        console.warn(
          "[LatentPay WARN] Banner missing during active stream. Re-injecting...",
        );
        const currentTarget = findLatestAssistantTurnContent();
        if (currentTarget) {
          activeBannerTarget = currentTarget;
          if (!activeBanner) {
            activeBanner = createSponsorBanner(activeAdForImpression);
          }
          injectBanner(currentTarget, activeBanner);
          updateRootBounds();
          activeBanner.style.opacity = "1";
          activeBanner.style.transform = "translateY(0)";
        }
      } else {
        // Ensure bounds are kept updated
        updateRootBounds();
      }
    }
  }

  // Run the monitoring loop at a very light 250ms interval
  setInterval(monitorState, 250);
})();
