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
// It's saved ready to use as a data URL, so the gif is encoded once rather than for every tab.
const downloadNext = async () => {
  const next = await fetch(CAT_URL);
  if (!next.ok) return;
  const cat = `data:${next.headers.get("content-type")};base64,${new Uint8Array(await next.arrayBuffer()).toBase64()}`;
  await (await caches.open("cat-urls")).put(CAT_URL, new Response(cat));
};

// Version 2.0 saved the raw gif in "cats". It's no longer read, so free the space.
chrome.runtime.onInstalled.addListener(() => caches.delete("cats"));

// content.js asks for a cat and gets it back as a data URL. Google's page can't
// read the extension's saved downloads, but it can show a data URL.
const getCat = async () => {
  const cache = await caches.open("cat-urls");
  let cat = await cache.match(CAT_URL);
  // A failed download is ignored: the saved cat stays, and the next tab tries again.
  downloading ??= downloadNext().catch(() => {}).finally(() => (downloading = null));
  // Very first tab (nothing saved yet): wait for the download.
  if (!cat) cat = await downloading.then(() => cache.match(CAT_URL));
  return cat?.text();
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Always reply, even if reading the saved cat fails, so the tab isn't left waiting.
  getCat().then(sendResponse, () => sendResponse());
  return true; // Keep the message open until we reply
});
