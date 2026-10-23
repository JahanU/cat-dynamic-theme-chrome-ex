// Chromium doesn't let extensions change its built-in new tab page, so new tabs
// are sent to the Google homepage instead, where content.js adds the cat.
// Only blank new tabs are redirected, not links opened in a new tab.
chrome.tabs.onCreated.addListener((tab) => {
  if (/^(chrome|brave|edge):\/\/newtab\/$/.test(tab.pendingUrl ?? tab.url)) {
    chrome.tabs.update(tab.id, { url: "https://www.google.com/" });
  }
});

// A cat gif takes a good few seconds to download from cataas.com, which is too slow for a new tab.
// So each tab gets the cat saved last time (instant), and the next cat downloads here
// in the background, ready for the following tab.

const CAT_URL = "https://cataas.com/cat/gif";

// The download in progress, if any. A tab that opens mid-download joins it
// instead of starting a second one.
let downloading = null;

// Only an OK response is saved, so a failed request never replaces the saved cat with an error page.
const downloadNext = async () => {
  const next = await fetch(CAT_URL);
  if (next.ok) await (await caches.open("cats")).put(CAT_URL, next);
};

// content.js asks for a cat and gets it back as a data URL. Google's page can't
// read the extension's saved downloads, but it can show a data URL.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const cache = await caches.open("cats");
    let cat = await cache.match(CAT_URL);
    downloading ??= downloadNext().finally(() => (downloading = null));
    // Very first tab (nothing saved yet): wait for the download.
    if (!cat) cat = await downloading.then(() => cache.match(CAT_URL), () => null);
    sendResponse(cat && `data:image/gif;base64,${new Uint8Array(await cat.arrayBuffer()).toBase64()}`);
  })();
  return true; // Keep the message open until we reply
});
