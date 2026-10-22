// A cat gif takes a good few seconds to download from cataas.com, which is too slow for a new tab.
// So each tab shows the cat that was saved earlier (instant), and asks background.js
// to download the next cat and save it for the following tab.

const CAT_URL = "https://cataas.com/cat/gif";

// Show the saved cat, if there is one. A blob URL points at the bytes already
// in memory, so the browser doesn't download the gif again.
const showSaved = async () => {
  const saved = await (await caches.open("cats")).match(CAT_URL);
  if (saved) document.body.style.backgroundImage = `url(${URL.createObjectURL(await saved.blob())})`;
  return saved;
};

const saved = await showSaved();
// Ask the background to download the next cat. This waits until it's saved.
await chrome.runtime.sendMessage("next");
// Very first tab (nothing was saved yet): show the cat that just arrived.
if (!saved) await showSaved();
