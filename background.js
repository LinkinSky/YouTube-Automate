// This function will inject the content script into the specified tab.
function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  });
}

// Listen for any updates to any tab in the browser.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We are only interested in YouTube video pages.
  // We also check if the tab's status is "complete" to ensure the page is ready.
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes("youtube.com/watch")) {
    console.log("YouTube video page detected. Injecting content script.");
    injectContentScript(tabId);
  }
});