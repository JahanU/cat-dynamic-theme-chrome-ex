// Runs on the Google homepage. Asks background.js for a cat and hands it to style.css.
chrome.runtime.sendMessage("cat", (cat) => {
  if (cat) document.documentElement.style.setProperty("--cat", `url(${cat})`);
});
