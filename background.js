// This Set acts as our "guest list" or bouncer.
// It will store the Tab IDs where the script has already been injected for the current page view.
const injectedTabs = new Set();

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // We only care about tabs that have finished loading and have a URL.
  if (changeInfo.status !== 'complete' || !tab.url) {
    return;
  }

  // Strict check: The URL must be a YouTube video page.
  try {
    const url = new URL(tab.url);
    if (url.hostname !== 'www.youtube.com' || url.pathname !== '/watch') {
      return;
    }
  } catch (e) {
    return; // Invalid URL, ignore.
  }

  // --- PING-PONG LOGIC ---
  // We "knock on the door" before entering.
  chrome.tabs.sendMessage(tabId, { type: "PING" }, (response) => {
    // Check if we received an error (meaning no one answered).
    if (chrome.runtime.lastError) {
      console.log(`Content script not found in tab ${tabId}. Injecting now.`);
      
      // The coast is clear, inject the script.
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(err => console.error("Error injecting script:", err));

    } else {
      // We received a "PONG" response, the script is already there.
      console.log(`Content script already active in tab ${tabId}. Doing nothing.`);
    }
  });
});