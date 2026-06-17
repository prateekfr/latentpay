// content.js - LatentPay Chrome Extension Content Script

(function () {
  let isGenerating = false;
  let startTime = 0;
  let activeBanner = null;
  let activeBannerTarget = null;
  let tickerInterval = null;
  let hasMetThreshold = false;

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

  // Helper to locate the active Stop button
  function findStopButton() {
    // 1. Check for the standard data-testid stop button
    const dataTestIdBtn = document.querySelector(
      'button[data-testid="stop-button"]',
    );
    if (dataTestIdBtn) return dataTestIdBtn;

    // 2. Check for any buttons containing aria-label with "Stop"
    const stopButtons = Array.from(document.querySelectorAll("button")).filter(
      (btn) => {
        const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();
        return (
          ariaLabel.includes("stop generating") ||
          ariaLabel.includes("stop streaming") ||
          ariaLabel === "stop"
        );
      },
    );
    return stopButtons[0] || null;
  }

  // Utility to check if ChatGPT is currently generating an answer
  function checkStopButtonExists() {
    if (findStopButton()) return true;

    // Check for any element with the streaming text animation class
    if (document.querySelector(".result-streaming")) return true;

    return false;
  }

  // Find the form/composer wrapper container containing the prompt input box
  function findComposerOrForm() {
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

    const composerRoot =
      document.querySelector('[data-testid="composer-root"]') ||
      document.querySelector(".composer-parent") ||
      document.querySelector("div.w-full.max-w-3xl");
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
  function createSponsorBanner() {
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
        --bg-color: #ffffff;
        --border-color: rgba(0, 0, 0, 0.08);
        --text-color: #1f2937;
        --text-muted: #6b7280;
        --accent-gradient: linear-gradient(135deg, #6366f1, #a855f7);
        --progress-bg: #e5e7eb;
        --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
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
        pointer-events: auto; /* Restores interactivity to the banner button */
        box-sizing: border-box;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      :host(.dark-theme) {
        --bg-color: #1e1e2e;
        --border-color: rgba(255, 255, 255, 0.08);
        --text-color: #cdd6f4;
        --text-muted: #a6adc8;
        --accent-gradient: linear-gradient(135deg, #89b4fa, #cba6f7);
        --progress-bg: #313244;
        --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        --dot-color: #f38ba8;
        --dot-bg: rgba(243, 139, 168, 0.1);
        --dot-border: rgba(243, 139, 168, 0.2);
      }

      .banner-card {
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 12px;
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
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
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
        0% { filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.2)); }
        50% { filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.6)); }
        100% { filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.2)); }
      }

      @keyframes scale-up {
        0% { transform: scale(0.8); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;

    const card = document.createElement("div");
    card.className = "banner-card";

    card.innerHTML = `
      <div class="banner-left">
        <div class="logo-icon">L</div>
        <div class="info-text">
          <div class="sponsor-title">Sponsored by LatentPay</div>
          <div class="sponsor-msg">Supporting free queries. View rewards active.</div>
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

    // Look for target and inject banner
    const target = findLatestAssistantTurnContent();
    if (target) {
      activeBannerTarget = target;
      activeBanner = createSponsorBanner();
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
    isGenerating = false;
    clearInterval(tickerInterval);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(
      `[LatentPay] Generation completed. Duration: ${duration.toFixed(2)}s`,
    );

    // If duration is at least 5 seconds, submit the real ingestion payload
    if (duration >= 5.0) {
      const payload = {
        userId: "mock-user-123",
        campaignId: "mock-campaign-abc",
        durationSeconds: parseFloat(duration.toFixed(2)),
      };

      console.log("[LatentPay] Submitting Impression Payload:", payload);

      fetch("http://localhost:3000/api/v1/impressions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.error || "Failed to submit impression");
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log(
            `[LatentPay] Payout transaction successful! Wallet balance: ${data.data.walletBalance}`,
            data,
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

    if (activeBanner) {
      const bannerToRemove = activeBanner;

      // Animate out nicely before removing from DOM
      bannerToRemove.style.opacity = "0";
      bannerToRemove.style.transform = "translateY(-4px)";

      setTimeout(() => {
        if (bannerToRemove && bannerToRemove.parentNode) {
          bannerToRemove.parentNode.removeChild(bannerToRemove);
        }
        // Reset root to full-screen after banner is fully removed
        const paneRoot = document.getElementById("latentpay-root");
        if (paneRoot) {
          paneRoot.style.left = "0";
          paneRoot.style.width = "100vw";
        }
      }, 300);

      activeBanner = null;
      activeBannerTarget = null;
    }
  }

  // Robust monitoring loop checking state transitions
  function monitorState() {
    const isGeneratingNow = checkStopButtonExists();

    if (isGeneratingNow && !isGenerating) {
      // Initialize observer tracking when active generation starts
      setupTracerObserver();
      startGeneration();
    } else if (!isGeneratingNow && isGenerating) {
      stopGeneration();
    } else if (isGenerating) {
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
            activeBanner = createSponsorBanner();
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
