document.addEventListener('DOMContentLoaded', function() {
    const jumpAheadToggle = document.getElementById('autoJumpAheadToggle');
    const nextShortToggle = document.getElementById('autoNextShortToggle');

    // Retrieve all saved values.
    chrome.storage.sync.get({ 
        autoJumpAheadEnabled: true,
        autoNextShortEnabled: true
    }, function(data) {
        jumpAheadToggle.checked = data.autoJumpAheadEnabled;
        nextShortToggle.checked = data.autoNextShortEnabled;
    });

    // Add listener for the Jump Ahead switch
    jumpAheadToggle.addEventListener('change', function() {
        chrome.storage.sync.set({ autoJumpAheadEnabled: this.checked });
    });

    // Add listener for the Auto Next Short switch
    nextShortToggle.addEventListener('change', function() {
        chrome.storage.sync.set({ autoNextShortEnabled: this.checked });
    });
});