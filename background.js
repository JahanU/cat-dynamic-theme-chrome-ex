// Helper to convert an ArrayBuffer to a Base64 string for Data URIs
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Redirect new empty tabs to a search engine with our cat theme
chrome.tabs.onCreated.addListener(async (tab) => {
    // Only redirect if the tab is meant to be a new tab page
    const isNewTab = tab.pendingUrl === "chrome://newtab/" ||
        tab.pendingUrl === "edge://newtab/" ||
        tab.pendingUrl === "brave://newtab/" ||
        tab.url === "chrome://newtab/" ||
        (!tab.pendingUrl && !tab.url);

    if (!isNewTab) return;

    let redirectUrl = "https://google.com";
    try {
        // Detect if the browser is Brave and route to its native search engine
        if (navigator.brave && await navigator.brave.isBrave()) {
            redirectUrl = "https://search.brave.com/";
        }
    } catch (e) {
        console.warn("Could not determine if browser is Brave", e);
    }

    chrome.tabs.update(tab.id, { url: redirectUrl });
});

// Listener for content scripts requesting the cat image securely
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCatGif") {
        fetch("https://cataas.com/cat/gif")
            .then(r => r.arrayBuffer())
            .then(buffer => {
                const base64 = arrayBufferToBase64(buffer);
                sendResponse({ dataUri: "data:image/gif;base64," + base64 });
            })
            .catch(e => {
                console.error("Failed to fetch cat gif:", e);
                sendResponse({ error: e.message });
            });

        // Return true to keep the message port open for our async fetch response
        return true;
    }
});
