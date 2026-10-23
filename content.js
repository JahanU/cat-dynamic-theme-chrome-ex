// Runs on the Google homepage. Asks background.js for a cat and hands it to style.css.
chrome.runtime.sendMessage("cat", (cat) => {
  if (!cat) return;
  // Turn the text back into the gif, and give CSS a short blob: URL pointing at it.
  // (A data: URL would be simpler, but the browser rejects URLs over 2MB, so big gifs wouldn't show.)
  const gif = new Blob([Uint8Array.fromBase64(cat.base64)], { type: cat.type });
  document.documentElement.style.setProperty("--cat", `url(${URL.createObjectURL(gif)})`);
});
