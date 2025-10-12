// background.js - Final English Version

/**
 * Listens for updates to any tab in the browser.
 * This is the main entry point to decide when to inject our content script.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We only act when the tab has finished loading and has a valid URL.
  if (changeInfo.status !== 'complete' || !tab.url) {
    return;
  }

  // Strict check to ensure we are on a YouTube video or shorts page.
  try {
    const url = new URL(tab.url);
    const isTargetPage = url.hostname === 'www.youtube.com' && (url.pathname === '/watch' || url.pathname.startsWith('/shorts/'));

    if (isTargetPage) {
      // --- PING-PONG LOGIC ---
      // This prevents injecting the script multiple times on the same page.
      // We "knock on the door" by sending a "PING" message.
      chrome.tabs.sendMessage(tabId, { type: "PING" }, (response) => {
        // If we get an error, it means no one answered the door (the script isn't there).
        if (chrome.runtime.lastError) {
          console.log(`Content script not found in tab ${tabId}. Injecting now.`);
          
          // The coast is clear, inject the script.
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }).catch(err => console.error("Error injecting script:", err));

        } else {
          // If we received a "PONG" response, the script is already active.
          console.log(`Content script already active in tab ${tabId}. Doing nothing.`);
        }
      });
    }
  } catch (e) { /* Invalid URL, do nothing. */ }
});