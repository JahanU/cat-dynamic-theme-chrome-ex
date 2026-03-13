/**
 * Brave Browser specific logic.
 * 
 * Brave Search has a very strict Content Security Policy (CSP) with an `img-src` directive
 * that blocks fetching images from third-party domains like `cataas.com`.
 * 
 * To bypass this, we use the background script to fetch the image buffer and convert it
 * to a base64 Data URI. The content script then requests this Data URI via `chrome.runtime.sendMessage`.
 * Since Data URIs are considered safe inline content by the CSP, the image successfully loads.
 */

export const BraveLogic = {
    redirectUrl: "https://search.brave.com/",

    // Converts an ArrayBuffer to a Base64 string
    arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    // Registers the message listener for the content script
    registerCSPBypassListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "getCatGif") {
                fetch("https://cataas.com/cat/gif")
                    .then(r => r.arrayBuffer())
                    .then(buffer => {
                        const base64 = this.arrayBufferToBase64(buffer);
                        sendResponse({ dataUri: "data:image/gif;base64," + base64 });
                    })
                    .catch(e => {
                        console.error("Failed to fetch cat gif:", e);
                        sendResponse({ error: e.message });
                    });

                // Return true to indicate we wish to send a response asynchronously
                return true;
            }
        });
    }
};
