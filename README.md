# Cat Dynamic Theme - Chrome & Brave Extension

A simple and fun browser extension that shows a random, adorable cat gif as your wallpaper whenever you open a new tab!

## Features
- Opens new tabs on the Google homepage (Brave Search in Brave) with a full-screen cat gif from [CATAAS (Cats as a service)](https://cataas.com/) behind it.
- Optional greeting: set your name in the extension's **Options** and the cat says "Hello {name}" in a random font, size and colour.
- Works in Chromium-based browsers, including Chrome and Brave.

## How it Works
Chromium doesn't let extensions modify the built-in new tab page, so `background.js` sends each new blank tab to `https://www.google.com/`, or to `https://search.brave.com/` in Brave. A content script there sets a gif from `https://cataas.com/cat/gif` as the page background. Each tab shows a gif saved by the previous tab while the next one downloads in the background, so the wallpaper appears instantly.

## Installation (Developer Mode)
To install the extension locally for testing or personal use:

1. Clone or download this repository to your computer.
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Brave: `brave://extensions/`
3. Enable **Developer mode** (usually a toggle in the top right corner).
4. Click the **Load unpacked** button.
5. Select the `cat-dynamic-theme-chrome-ex` folder you downloaded.
6. Optional: right-click the extension's icon, choose **Options**, and enter your name.
7. Open a new tab and enjoy the cats!
