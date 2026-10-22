// Downloads the next cat here, in the extension's background, instead of in the tab.
// The background keeps running when a tab is refreshed or closed, so a download
// started by one tab finishes and gets saved even if that tab goes away.

const CAT_URL = "https://cataas.com/cat/gif";

// The download in progress, if any. A tab that opens mid-download joins it
// instead of starting a second one.
let downloading = null;

// Only an OK response is saved, so a failed request never replaces the saved cat with an error page.
const downloadNext = async () => {
  const next = await fetch(CAT_URL);
  if (next.ok) await (await caches.open("cats")).put(CAT_URL, next);
};

// A new tab sends a message to ask for the next cat. We reply once it's saved,
// so the very first tab (nothing saved yet) knows when it can show it.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  downloading ??= downloadNext().finally(() => (downloading = null));
  downloading.then(() => sendResponse(), () => sendResponse());
  return true; // Keep the message open until we reply
});
