// A cat gif takes a good few seconds to download from cataas.com, which is too slow for a new tab.
// So each tab shows the cat the previous tab saved (instant), then downloads the
// next cat in the background and saves it for the following tab.

const CAT_URL = "https://cataas.com/cat/gif";
const FONTS = ["Andale Mono", "Impact", "Arial", "Arial Black", "Comic Sans MS", "Courier New", "Georgia", "Times New Roman", "Verdana"];
const random = (n) => Math.floor(Math.random() * n);

// With a name saved in the options page, the cat says hello in a random font, size and colour.
// Full saturation and 60% lightness keep every random colour bright enough to read.
const catUrl = (name) => {
  if (!name) return CAT_URL;
  const style = new URLSearchParams({
    font: FONTS[random(FONTS.length)],
    fontSize: 30 + random(21),
    fontColor: `hsl(${random(360)}, 100%, 60%)`,
  });
  // cataas puts the text into an image template without escaping it, so "&" or "<" in a name would break it
  const text = `Hello ${name}`.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  return `${CAT_URL}/says/${encodeURIComponent(text)}?${style}`;
};

// Set a downloaded gif as the wallpaper. A blob URL points at the bytes already
// in memory, so the browser doesn't download the gif again.
const show = async (res) => document.body.style.backgroundImage = `url(${URL.createObjectURL(await res.blob())})`;

const cache = await caches.open("cats"); // Opens a named storage box for saved downloads
const saved = await cache.match(CAT_URL); // Looks in the box for something saved under that address (always CAT_URL, whatever URL the cat came from). It gives back the saved gif, or nothing on the very first tab.
if (saved) await show(saved);

// Download the next cat. Only an OK response is saved, so a failed request
// never replaces the saved cat with an error page.
const { name } = await chrome.storage.sync.get("name");
const next = await fetch(catUrl(name));
if (next.ok) {
  // Very first tab (nothing saved yet): show this cat as soon as it arrives.
  // clone() is needed because a response body can only be read once.
  if (!saved) await show(next.clone());
  await cache.put(CAT_URL, next);
}
