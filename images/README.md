# Product photos

Drop product photos in this folder. Filenames must match the `image` paths in `../products.json` (e.g., `kotak-8x50x150.jpg`, `bulat-25x200.jpg`).

## How to get all 25 photos at once

**See [`../download-images.md`](../download-images.md)** — has a paste-and-go browser console snippet that harvests all 25 image URLs from your Tokopedia shop, builds a Terminal `curl` command, and copies it to your clipboard. Run that command → all 25 download with the right filenames. Total: ~60 seconds.

There's also a manual right-click-save table in the same doc as a fallback.

## Optional: shop logo

If you have a shop logo, save it as `logo.jpg` here. The hero on `index.html` will auto-detect and swap it in (see `script.js` → `applyShopInfo`).

## Notes on file format

- `.jpg` preferred (smaller). PNG is fine but rename the extension to `.jpg` to match `products.json`, or update the `image` paths in JSON to `.png`.
- Square or near-square aspect ratio. The site crops to 1:1.
- 600×600 minimum, 1200×1200 ideal. Anything over 80 KB per image — compress at [squoosh.app](https://squoosh.app/) before committing.

## What if I add photos for only some products?

The site renders fine without photos. Cards show a striped placeholder with the product name where the image would be. Add photos for your top sellers first, backfill the rest later — no rebuild needed.
