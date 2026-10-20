// A cat gif takes a good few seconds to download from cataas.com, which is too slow for a new tab.
// So each tab shows the cat the previous tab saved (instant), then downloads the
// next cat in the background and saves it for the following tab.

const CAT_URL = "https://cataas.com/cat/gif";

// Set a downloaded gif as the wallpaper. A blob URL points at the bytes already
// in memory, so the browser doesn't download the gif again.
const show = async (res) => document.body.style.backgroundImage = `url(${URL.createObjectURL(await res.blob())})`;

const cache = await caches.open("cats"); // Opens a named storage box for saved downloads
const saved = await cache.match(CAT_URL); // Looks in the box for something saved under that address. It gives back the saved gif, or nothing on the very first tab.
if (saved) await show(saved);

// Download the next cat. Only an OK response is saved, so a failed request
// never replaces the saved cat with an error page.
const next = await fetch(CAT_URL);
if (next.ok) {
  // Very first tab (nothing saved yet): show this cat as soon as it arrives.
  // clone() is needed because a response body can only be read once.
  if (!saved) await show(next.clone());
  await cache.put(CAT_URL, next);
}
