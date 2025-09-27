// Log a message to the browser console to confirm the script is running.
console.log("YouTube Auto Jump Ahead is active!");

// The CORRECT technical HTML tag name for the container, found via debugging.
const CONTAINER_TAG_NAME = 'ytw-timely-action-view-model';

/**
 * Searches for and clicks the button within a given element.
 * @param {HTMLElement} element - The element to search within.
 */
function findAndClickButtonIn(element) {
  const button = element.querySelector('button');
  if (button) {
    console.log("Jump Ahead button found. Clicking now...");
    button.click();
  }
}

/**
 * The main observer callback. Watches for the target container to be added to the page.
 */
function pageObserverCallback(mutations) {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const addedNode of mutation.addedNodes) {
        // Ensure the node is an element and matches our PROVEN target tag name.
        if (addedNode.nodeType === 1 && addedNode.nodeName.toLowerCase() === CONTAINER_TAG_NAME) {
          
          console.log(`Correct container "${CONTAINER_TAG_NAME}" detected.`);
          
          const containerObserver = new MutationObserver(() => {
            findAndClickButtonIn(addedNode);
          });

          containerObserver.observe(addedNode, { childList: true, subtree: true });
          findAndClickButtonIn(addedNode);
        }
      }
    }
  }
}

/**
 * This function sets up the main observer once the video player is ready.
 */
function startObserver() {
  console.log("Video player found. Starting the main observer.");
  const pageObserver = new MutationObserver(pageObserverCallback);
  pageObserver.observe(document.body, { childList: true, subtree: true });
}

// ---- Main execution ----
// We wait for the main video player to exist before we start observing.
// This is the most robust way to handle YouTube's dynamic loading.

const readyCheckInterval = setInterval(() => {
  if (document.querySelector('#movie_player')) {
    clearInterval(readyCheckInterval);
    startObserver();
  }
}, 250);