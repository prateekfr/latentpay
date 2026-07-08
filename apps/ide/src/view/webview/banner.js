(function () {
  const vscode = acquireVsCodeApi();
  const card = document.querySelector(".banner-card");
  const title = document.getElementById("title");
  const msg = document.getElementById("msg");
  const pill = document.getElementById("pill");
  const fill = document.getElementById("fill");
  const logo = document.getElementById("logo");

  const DEFAULT_LOGO_HTML = logo.innerHTML;

  let tickHandle = null;
  let startedAt = 0;
  let thresholdMs = 5000;
  let currentTargetUrl = null;

  card.addEventListener("click", () => {
    if (!currentTargetUrl) return;
    vscode.postMessage({ type: "openLink", url: currentTargetUrl });
  });

  function clearTick() {
    if (tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
  }

  // Built via DOM APIs (not innerHTML string concatenation) since
  // `brandIconUrl` is advertiser-supplied — no manual escaping needed this way.
  function applyAd(ad) {
    if (!ad) {
      title.textContent = "LatentPay";
      logo.innerHTML = DEFAULT_LOGO_HTML;
      currentTargetUrl = null;
      card.classList.remove("clickable");
      return;
    }
    currentTargetUrl = ad.targetUrl || null;
    card.classList.toggle("clickable", !!currentTargetUrl);
    title.textContent = ad.companyName || "LatentPay";
    if (ad.brandIconUrl) {
      logo.innerHTML = "";
      const img = document.createElement("img");
      img.src = ad.brandIconUrl;
      img.alt = "";
      img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:7px;";
      logo.appendChild(img);
    } else {
      logo.innerHTML = DEFAULT_LOGO_HTML;
    }
  }

  function setIdle() {
    clearTick();
    applyAd(null);
    msg.textContent = "Waiting for your AI to start thinking…";
    pill.className = "status-pill pending";
    pill.innerHTML = '<div class="pulse-dot"></div><span class="status-label">Idle</span>';
    fill.style.width = "0%";
    fill.classList.remove("finished");
  }

  function tick() {
    const elapsed = Date.now() - startedAt;
    const pct = Math.min((elapsed / thresholdMs) * 100, 100);
    fill.style.width = pct + "%";
    const label = pill.querySelector(".status-label");
    if (label) {
      const remaining = Math.max((thresholdMs - elapsed) / 1000, 0).toFixed(1);
      label.textContent = elapsed < thresholdMs ? `View ${remaining}s` : "Confirming…";
    }
  }

  function setGenerating(threshold, ad) {
    clearTick();
    thresholdMs = threshold;
    startedAt = Date.now();
    applyAd(ad);
    msg.textContent = ad.adLine || "Your AI is thinking. Keep this panel visible to earn.";
    pill.className = "status-pill pending";
    pill.innerHTML = '<div class="pulse-dot"></div><span class="status-label">View 0.0s</span>';
    fill.classList.remove("finished");
    tickHandle = setInterval(tick, 100);
    tick();
  }

  function setCredited(payoutAmount, ad) {
    clearTick();
    applyAd(ad);
    fill.style.width = "100%";
    fill.classList.add("finished");
    pill.className = "status-pill success";
    pill.innerHTML =
      '<svg class="checkmark-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      `<span>+$${payoutAmount.toFixed(2)} Earned</span>`;
    msg.textContent = "Nice — logged to your LatentPay wallet.";
  }

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.type !== "state") return;
    const state = data.state;
    if (state.kind === "idle") setIdle();
    else if (state.kind === "generating") setGenerating(state.thresholdMs, state.ad);
    else if (state.kind === "credited") setCredited(state.payoutAmount, state.ad);
  });

  setIdle();
})();
