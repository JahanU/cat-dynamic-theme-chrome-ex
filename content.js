/**
 * This content script is injected into Brave Search to bypass its strict Content Security Policy (CSP).
 * 
 * Brave blocks images from third-party domains in its `img-src` directive:
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src
 * 
 * However, the policy allows `data:` schemas. Since we cannot load images directly from cataas.com 
 * via CSS, we request a Base64 encoded Data URI of the image from the background service worker.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 */
chrome.runtime.sendMessage({ action: "getCatGif" }, (response) => {
    if (response && response.dataUri) {
        // Apply the image as a Data URI to the background of the page
        document.documentElement.style.setProperty('background-image', `url(${response.dataUri})`, 'important');
        document.body.style.setProperty('background-image', `url(${response.dataUri})`, 'important');
        
        // Ensure any main wrapper in Search Engine doesn't have a solid background blocking it
        const braveAppContent = document.getElementById("app") || document.querySelector("main");
        if (braveAppContent) {
           braveAppContent.style.setProperty("background-color", "transparent", "important");
        }
        
        // Keep observing in case it's a dynamic SPA like Brave Search that replaces DOM elements
        const observer = new MutationObserver(() => {
            const el = document.getElementById("app") || document.querySelector("main");
            if (el) el.style.setProperty("background-color", "transparent", "important");
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});
