document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("userIdInput");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Load saved ID
  chrome.storage.sync.get(["userId"], (result) => {
    if (result.userId) {
      input.value = result.userId;
    }
  });

  // Save ID
  saveBtn.addEventListener("click", () => {
    const userId = input.value.trim();
    if (!userId) {
      statusMsg.style.color = "#ffb4ab";
      statusMsg.textContent = "User ID cannot be empty!";
      return;
    }

    chrome.storage.sync.set({ userId }, () => {
      statusMsg.style.color = "#34d399";
      statusMsg.textContent = "Settings saved successfully!";
      setTimeout(() => {
        statusMsg.textContent = "";
      }, 2000);
    });
  });
});
