// Wait for the popup's DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('autoJumpAheadToggle');

    // Retrieve the saved value for "Auto Jump Ahead" from storage.
    // The '?? true' sets the default value to true if it doesn't exist yet.
    chrome.storage.sync.get({ autoJumpAheadEnabled: true }, function(data) {
        toggle.checked = data.autoJumpAheadEnabled;
    });

    // Keep the listener for our single switch
    toggle.addEventListener('change', function() {
        chrome.storage.sync.set({ autoJumpAheadEnabled: this.checked });
    });
});