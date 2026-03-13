# Cat Dynamic Theme - Chrome & Brave Extension

A simple and fun browser extension that adds a random, adorable cat gif as your wallpaper whenever you open a new tab!

## Features
- Overrides the default new tab experience to display a full-screen, high-quality cat gif sourced from [CATAAS (Cats as a service)](https://cataas.com/).
- **Chrome Support**: Fast, native CSS injection on `google.com`.
- **Brave Browser Support**: Automatically detects Brave and overrides `search.brave.com`. Includes a background service worker architecture to dynamically inject the image as a Base64 Data URI, bypassing Brave Search's strict Content Security Policy (CSP).

## How it Works
Due to strict browser security preventing extensions from injecting code directly into the native `chrome://newtab/` or `brave://newtab/` pages, this extension works by detecting when a new empty tab is created and instantly redirecting it to a search engine. 

It checks the browser type and redirects to `https://google.com` (for Chrome users) or `https://search.brave.com/` (for Brave users). It then seamlessly injects CSS and Content Scripts onto those domains to set the cat gif as the page background.

## Installation (Developer Mode)
To install the extension locally for testing or personal use:

1. Clone or download this repository to your computer.
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Brave: `brave://extensions/`
3. Enable **Developer mode** (usually a toggle in the top right corner).
4. Click the **Load unpacked** button.
5. Select the `cat-dynamic-theme-chrome-ex` folder you downloaded.
6. Open a new tab and enjoy the cats!