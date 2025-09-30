// --- PING-PONG RESPONDER ---
// This script responds "PONG" if the background script sends a "PING".
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ status: "PONG" });
  }
  return true; // Required to indicate the response will be sent asynchronously.
});

// Variable to hold a reference to our main observer, so we can stop it.
let pageObserver = null;

const JUMP_AHEAD_CONTAINER = 'ytw-timely-action-view-model';

// --- Logic Functions ---

function handleFoundJumpAhead(containerNode) {
    console.log(`Jump Ahead container found.`);
    const button = containerNode.querySelector('button');
    if (button) {
        console.log("Clicking Jump Ahead button...");
        button.click();
    }
}

function pageObserverCallback(mutations) {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.nodeType === 1 && addedNode.nodeName.toLowerCase() === JUMP_AHEAD_CONTAINER) {
                    handleFoundJumpAhead(addedNode);
                }
            }
        }
    }
}

/**
 * Scans the page for elements that already exist upon activation.
 */
function scanPageForExistingElements() {
    const existingContainers = document.querySelectorAll(JUMP_AHEAD_CONTAINER);
    existingContainers.forEach(container => handleFoundJumpAhead(container));
}

// --- Start/Stop Logic ---

function startLogic() {
    if (pageObserver) return; // Already running, do nothing.
    console.log("▶️ Auto Jump Ahead STARTED.");
    pageObserver = new MutationObserver(pageObserverCallback);
    pageObserver.observe(document.body, { childList: true, subtree: true });
    // Immediately scan for elements that might already be on the page.
    scanPageForExistingElements();
}

function stopLogic() {
    if (pageObserver) {
        pageObserver.disconnect();
        pageObserver = null;
        console.log("⏹️ Auto Jump Ahead STOPPED.");
    }
}

// --- Initialization and Storage Listener ---

// 1. Initial startup logic
function initialize() {
    chrome.storage.sync.get({ autoJumpAheadEnabled: true }, (data) => {
        if (data.autoJumpAheadEnabled) {
            startLogic();
        }
    });
}

// Wait for the player to exist before initializing.
const readyCheckInterval = setInterval(() => {
    if (document.querySelector('#movie_player')) {
        clearInterval(readyCheckInterval);
        initialize();
    }
}, 250);

// 2. Listen for future changes from the popup to toggle the feature on/off.
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.autoJumpAheadEnabled) {
        const newValue = changes.autoJumpAheadEnabled.newValue;
        console.log(`Auto Jump Ahead is now ${newValue ? 'ENABLED' : 'DISABLED'}`);
        if (newValue) {
            startLogic();
        } else {
            stopLogic();
        }
    }
});