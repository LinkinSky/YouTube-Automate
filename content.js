// content.js - Final English Version

// --- PING-PONG RESPONDER ---
// Listens for a "PING" from the background script and responds "PONG"
// to confirm that it is already injected and running.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ status: "PONG" });
    return true; // Indicates an asynchronous response.
  }
});

// ===================================================================
// GLOBAL VARIABLES
// ===================================================================
let jumpAheadObserver = null;
let shortsObserver = null;
let handledVideoSources = new Set();
let shortsDebounceTimer = null;

// ===================================================================
// "AUTO JUMP AHEAD" FEATURE FUNCTIONS
// ===================================================================

/**
 * Called when a "Jump Ahead" container is found. Finds the button inside and clicks it.
 * @param {HTMLElement} containerNode The container element.
 */
function handleFoundJumpAhead(containerNode) {
  const button = containerNode.querySelector('button');
  if (button) {
    console.log("Clicking Jump Ahead button...");
    button.click();
  }
}

/**
 * Scans the page for any "Jump Ahead" containers that might already exist.
 */
function scanPageForJumpAhead() {
  document.querySelectorAll('ytw-timely-action-view-model').forEach(handleFoundJumpAhead);
}

/**
 * Starts the "Auto Jump Ahead" feature by creating and starting a MutationObserver.
 */
function startJumpAhead() {
  if (jumpAheadObserver) return;
  console.log("▶️ Auto Jump Ahead STARTED.");
  jumpAheadObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeType === 1 && addedNode.nodeName.toLowerCase() === 'ytw-timely-action-view-model') {
          handleFoundJumpAhead(addedNode);
        }
      }
    }
  });
  jumpAheadObserver.observe(document.body, { childList: true, subtree: true });
  scanPageForJumpAhead();
}

/**
 * Stops the "Auto Jump Ahead" feature by disconnecting the observer.
 */
function stopJumpAhead() {
  if (jumpAheadObserver) {
    jumpAheadObserver.disconnect();
    jumpAheadObserver = null;
    console.log("⏹️ Auto Jump Ahead STOPPED.");
  }
}

// ===================================================================
// "AUTO NEXT SHORT" FEATURE FUNCTIONS
// ===================================================================

/**
 * Step 3: Handles a newly found active video by attaching the end-of-video listener.
 * @param {HTMLVideoElement} videoElement The active video element.
 */
function handleActiveVideo(videoElement) {
  const videoSrc = videoElement.src;
  if (!videoSrc || handledVideoSources.has(videoSrc)) return;

  handledVideoSources.add(videoSrc);
  console.log("New active short found. Attaching timeupdate listener.");

  const checkTime = () => {
    // When the video is within 0.3s of its end, proceed.
    if (videoElement.duration && videoElement.currentTime >= videoElement.duration - 0.3) {
      videoElement.removeEventListener('timeupdate', checkTime);
      const nextButton = document.querySelector('#navigation-button-down button');
      if (nextButton) {
        console.log("Short finished. Clicking next...");
        nextButton.click();
        // The MutationObserver will detect the page change and trigger the next search.
      }
    }
  };
  videoElement.addEventListener('timeupdate', checkTime);
}

/**
 * Step 2: Searches the page for a new, unhandled active short.
 */
function findAndHandleActiveShort() {
  const activeVideo = document.querySelector('ytd-reel-video-renderer[is-active] video');
  if (activeVideo && activeVideo.src) {
    handleActiveVideo(activeVideo);
  }
}

/**
 * Step 1: Starts the "Auto Next Short" feature.
 */
function startAutoNextShort() {
  if (shortsObserver) return;
  console.log("▶️ Auto Next Short STARTED.");
  
  const shortsContainer = document.querySelector('ytd-shorts');
  if (!shortsContainer) {
    // If the container isn't ready, try again shortly.
    setTimeout(startAutoNextShort, 500);
    return;
  }

  // This observer acts as a permanent "motion detector".
  // It triggers a new search whenever the shorts container changes.
  shortsObserver = new MutationObserver(() => {
    // Debounce: wait for changes to settle before searching.
    clearTimeout(shortsDebounceTimer);
    shortsDebounceTimer = setTimeout(findAndHandleActiveShort, 150);
  });

  shortsObserver.observe(shortsContainer, { childList: true, subtree: true });
  
  // Perform an initial search when the feature starts.
  findAndHandleActiveShort();
}

/**
 * Stops the "Auto Next Short" feature.
 */
function stopAutoNextShort() {
  if (shortsObserver) {
    shortsObserver.disconnect();
    shortsObserver = null;
  }
  clearTimeout(shortsDebounceTimer);
  handledVideoSources.clear(); // Clear the memory of handled videos
  console.log("⏹️ Auto Next Short STOPPED.");
}

// ===================================================================
// INITIALIZATION AND SETTINGS MANAGEMENT
// ===================================================================
function initialize() {
  console.log("[Content Script] 👋 HELLO! I am running and initializing features.");
  const isWatchPage = window.location.pathname === '/watch';
  const isShortsPage = window.location.pathname.startsWith('/shorts/');

  // 1. Handle the initial state on page load
  chrome.storage.sync.get({
    autoJumpAheadEnabled: true,
    autoNextShortEnabled: true
  }, (settings) => {
    if (isWatchPage && settings.autoJumpAheadEnabled) startJumpAhead();
    if (isShortsPage && settings.autoNextShortEnabled) startAutoNextShort();
  });

  // 2. Handle real-time changes from the popup
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.autoJumpAheadEnabled && isWatchPage) {
      changes.autoJumpAheadEnabled.newValue ? startJumpAhead() : stopJumpAhead();
    }
    if (changes.autoNextShortEnabled && isShortsPage) {
      changes.autoNextShortEnabled.newValue ? startAutoNextShort() : stopAutoNextShort();
    }
  });
}

// Wait for the document to be ready before initializing everything.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}