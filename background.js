// Chromium doesn't let extensions change its built-in new tab page, so new tabs
// are sent to the browser's own search homepage instead (Brave Search in Brave,
// Google otherwise), where content.js adds the cat.
// (Not Bing in Edge: Edge doesn't let extensions run on Bing.)
// Only blank new tabs are redirected, not links opened in a new tab.
const isBrave = navigator.userAgentData?.brands.some(({ brand }) => brand === "Brave");
const HOMEPAGE = isBrave ? "https://search.brave.com/" : "https://www.google.com/";

chrome.tabs.onCreated.addListener((tab) => {
  if (/^(chrome|brave|edge):\/\/newtab\/$/.test(tab.pendingUrl ?? tab.url)) {
    chrome.tabs.update(tab.id, { url: HOMEPAGE });
  }
});

// A cat gif takes a good few seconds to download from cataas.com, which is too slow for a new tab.
// So each tab gets the cat saved last time (instant), and the next cat downloads here
// in the background, ready for the following tab.

const CAT_URL = "https://cataas.com/cat/gif";

// Downloads a new cat, saves it for the next tab and returns it.
// The gif is saved as base64 (its bytes written out as text), since messages to
// the search page can only carry text. content.js turns it back into a gif.
const downloadNext = async () => {
  // The browser stops this background script after 30s with no extension calls, even mid-download,
  // so a cheap call every 20s keeps it running on a slow connection.
  const keepAlive = setInterval(chrome.runtime.getPlatformInfo, 20e3);
  try {
    const gif = await fetch(CAT_URL);
    if (!gif.ok) return; // Keep the saved cat rather than save an error page
    const type = gif.headers.get("content-type");
    const base64 = new Uint8Array(await gif.arrayBuffer()).toBase64();
    const cat = { type, base64 };
    await chrome.storage.local.set({ cat });
    return cat;
  } finally {
    clearInterval(keepAlive);
  }
};

// The download in progress, if any. A tab that opens mid-download shares it
// instead of starting a second one.
let downloading = null;

// Returns the saved cat, and starts downloading the next one.
const getCat = async () => {
  if (!downloading) {
    // A failed download is ignored: the saved cat stays, and the next tab tries again.
    downloading = downloadNext().catch(() => {}).finally(() => (downloading = null));
  }
  const next = downloading; // Kept here, as `downloading` is cleared once it finishes
  const { cat } = await chrome.storage.local.get("cat");
  // Very first tab (nothing saved yet): wait for the download.
  return cat ?? (await next);
};

// content.js asks for a cat. Always reply, even if something fails, so the tab isn't left waiting.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  getCat().then(sendResponse, () => sendResponse());
  return true; // Keep the message open until we reply
});
