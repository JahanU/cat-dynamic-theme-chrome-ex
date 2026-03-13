import { BraveLogic } from './brave.js';
import { ChromeLogic } from './chrome.js';

chrome.tabs.onCreated.addListener(async function (tab) {
  // Only redirect if the tab is meant to be a new tab page
  if (tab.pendingUrl === "chrome://newtab/" || tab.pendingUrl === "edge://newtab/" || tab.pendingUrl === "brave://newtab/" || tab.url === "chrome://newtab/" || !tab.pendingUrl && !tab.url) {
    let redirectUrl = ChromeLogic.redirectUrl;

    try {
      // Detect if the browser is Brave
      if (navigator.brave && await navigator.brave.isBrave()) {
        redirectUrl = BraveLogic.redirectUrl;
      }
    } catch (e) {
      // navigator.brave might not be available
      console.warn("Could not determine if browser is Brave", e);
    }

    chrome.tabs.update(tab.id, { url: redirectUrl });
  }
});

// Initialize Brave's CSP bypass listener
// We can always register this listener regardless of the browser
// as it won't be triggered unless the content script requests it.
BraveLogic.registerCSPBypassListener();
