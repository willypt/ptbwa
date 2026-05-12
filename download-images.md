# Download all 25 product photos

Tokopedia signs image URLs with a ~1-hour expiry, so I can't give you static "click to download" links that work tomorrow. The fix: use one of the methods below. Method 1 is by far the fastest — ~60 seconds total.

---

## Method 1: Browser snippet + Terminal (fastest, ~60 sec)

This snippet runs on your Tokopedia shop page, harvests all 25 image URLs while they're still valid, and gives you a single Terminal command that downloads everything with the correct filenames.

### Step 1 — open your shop

In your browser, open https://www.tokopedia.com/buanawisesa and let it finish loading.

### Step 2 — paste this snippet in DevTools console

Open DevTools (`Cmd + Option + I` on Mac), click the **Console** tab, paste this whole block, press Enter:

```js
(async () => {
  const FILENAME_MAP = new Map([
    ['PLAT BESI KOTAK 12MM x 300MM x300MM',         'kotak-12x300x300.jpg'],
    ['PLAT BESI KOTAK 4MM x 200MM x 200MM',         'kotak-4x200x200.jpg'],
    ['PLAT BESI KOTAK 3MM x 200MM x 250MM',         'kotak-3x200x250.jpg'],
    ['PLAT BESI KOTAK 10MM x 100MM x 150MM',        'kotak-10x100x150.jpg'],
    ['PLAT BESI KOTAK 8MM x 50MM x 150MM',          'kotak-8x50x150.jpg'],
    ['PLAT BESI KOTAK 8MM x 100MM x 150MM',         'kotak-8x100x150.jpg'],
    ['PLAT BESI KOTAK 12MM / 20MM x 350MM x 350MM', 'kotak-12-20x350x350.jpg'],
    ['PLAT BESI KOTAK 12MM / 20MM x 300MM x 300MM', 'kotak-12-20x300x300.jpg'],
    ['PLAT BESI KOTAK 12MM / 20MM x 200MM x 200MM', 'kotak-12-20x200x200.jpg'],
    ['PLAT BESI KOTAK 12MM / 20MM x 600MM x 300MM', 'kotak-12-20x600x300.jpg'],
    ['PLAT BESI KOTAK 12MM / 20MM x 400MM x 250MM', 'kotak-12-20x400x250.jpg'],
    ['PLAT BESI KOTAK 12MM / 20MM x 350MM x 225MM', 'kotak-12-20x350x225.jpg'],
    ['PLAT BESI KOTAK 12MM / 20MM x 300MM x 200MM', 'kotak-12-20x300x200.jpg'],
    ['PLAT BESI KOTAK 12MM / 20MM x 250MM x 175MM', 'kotak-12-20x250x175.jpg'],
    ['PLAT BESI KOTAK 12MM x 100MM x 300MM',        'kotak-12x100x300.jpg'],
    ['PLAT BESI KOTAK 12MM x 250MM x 300MM',        'kotak-12x250x300.jpg'],
    ['PLAT BESI BULAT 5MM DIAMETER 200MM',          'bulat-5x200.jpg'],
    ['PLAT BESI BULAT 8MM DIAMETER 200MM',          'bulat-8x200.jpg'],
    ['PLAT BESI BULAT 8MM DIAMETER 250MM',          'bulat-8x250.jpg'],
    ['PLAT BESI BULAT 10MM DIAMETER 200MM',         'bulat-10x200.jpg'],
    ['PLAT BESI BULAT 10MM DIAMETER 250MM',         'bulat-10x250.jpg'],
    ['PLAT BESI BULAT 12MM DIAMETER 150MM',         'bulat-12x150.jpg'],
    ['PLAT BESI BULAT 12MM DIAMETER 250MM',         'bulat-12x250.jpg'],
    ['PLAT BESI BULAT 15MM OD 200MM ID 40MM',       'bulat-15-od200-id40.jpg'],
    ['PLAT BESI BULAT 25MM DIAMETER 200MM',         'bulat-25x200.jpg'],
  ]);

  // A real product photo is at least ~500px wide. Tokopedia's lazy-load
  // placeholder SVG is a 256x256 skeleton — naturalWidth=256, so we filter
  // anything < 400. Also reject inline data: URIs (another placeholder form).
  const isRealImage = (img) =>
    img && img.complete && img.naturalWidth >= 400 && !img.src.startsWith('data:');

  const cardSelector = 'a[href*="/buanawisesa/plat-besi-"]';

  // --- Phase 1: progressive scroll so every card enters viewport long enough
  // for Tokopedia's intersection observer to swap the placeholder src.
  console.log('🔄 Phase 1: progressive scroll to mount all cards...');
  const step = Math.max(200, window.innerHeight * 0.4);
  let y = 0;
  let prevH = 0;
  for (let i = 0; i < 100; i++) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 350));
    y += step;
    const h = document.body.scrollHeight;
    if (y > h) {
      if (h === prevH) break;
      prevH = h;
      y = h - window.innerHeight;
    }
  }

  // --- Phase 2: force each product card into view (block:'center'),
  // pausing per card so the observer fires and the real image loads.
  let cards = [...document.querySelectorAll(cardSelector)];
  console.log(`🔄 Phase 2: forcing ${cards.length} cards into view individually...`);
  for (const card of cards) {
    card.scrollIntoView({ behavior: 'instant', block: 'center' });
    await new Promise((r) => setTimeout(r, 200));
  }

  // --- Phase 3: retry loop — for any card whose img is still placeholder,
  // scroll it center and wait again. Up to 6 retry passes.
  for (let attempt = 1; attempt <= 6; attempt++) {
    cards = [...document.querySelectorAll(cardSelector)];
    const pending = cards.filter((c) => !isRealImage(c.querySelector('img')));
    if (pending.length === 0) break;
    console.log(`🔁 Phase 3 attempt ${attempt}: ${pending.length} images still placeholder...`);
    for (const card of pending) {
      card.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise((r) => setTimeout(r, 450));
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 300));

  // --- Phase 4: extract URLs, matching by title prefix. Skip placeholders.
  cards = [...document.querySelectorAll(cardSelector)];
  const seen = new Map();
  const cardTextNormalized = (card) =>
    (card.textContent || '').replace(/\s+/g, ' ').trim();

  cards.forEach((card) => {
    const img = card.querySelector('img');
    if (!isRealImage(img)) return; // skip placeholders
    const text = cardTextNormalized(card);
    for (const [prefix, filename] of FILENAME_MAP) {
      const normalizedPrefix = prefix.replace(/\s+/g, ' ');
      if (text.includes(normalizedPrefix) && !seen.has(filename)) {
        seen.set(filename, img.src);
        break;
      }
    }
  });

  const found = seen.size;
  const total = FILENAME_MAP.size;
  const missing = [...FILENAME_MAP.values()].filter((f) => !seen.has(f));

  if (found === total) {
    console.log(`%c✅ Found all ${total} products with real images.`, 'color:#0a0;font-weight:bold');
  } else {
    console.warn(`%c⚠️  Found ${found} / ${total}. Missing:`, 'color:#c33;font-weight:bold', missing);
    console.warn('Try scrolling those products into view manually, then re-run the snippet.');
  }

  // --- Phase 5: build Terminal curl command and copy to clipboard.
  const headerLine = 'mkdir -p ~/Downloads/buanawisesa-images && cd ~/Downloads/buanawisesa-images';
  const curlLines = [...seen.entries()].map(
    ([filename, url]) =>
      `curl -L -A "Mozilla/5.0" -e "https://www.tokopedia.com/" -o "${filename}" "${url}"`
  );
  const script = [headerLine, ...curlLines].join(' && \\\n  ');

  console.log('%cTerminal command (also copied to clipboard):', 'font-weight:bold;color:#0a0');
  console.log(script);

  try {
    await navigator.clipboard.writeText(script);
    console.log('%c📋 Copied. Paste in Terminal and hit Enter.', 'color:#0a0;font-weight:bold');
  } catch (e) {
    console.warn('Clipboard write blocked. Manually copy the script above.');
  }
})();
```

> **If you ran an earlier version of this snippet and got placeholder SVGs:** the new snippet's curl commands will **overwrite** the broken files when you re-run. No need to manually delete anything.

### Step 3 — run the Terminal command

Open **Terminal** (Cmd+Space → "Terminal"), paste (Cmd+V), Enter. All 25 images download to `~/Downloads/buanawisesa-images/` with correct filenames.

### Step 4 — move to your repo

```bash
mv ~/Downloads/buanawisesa-images/* "/path/to/buanawisesa-site/images/"
```

(Adjust the path to wherever you put the site folder.)

---

## Method 2: Manual right-click (~4 minutes)

For each row: click the Tokopedia URL → right-click the main image → **Save Image As…** → type the filename → save into `images/`.

### Plat Besi Kotak (16)

| Save as → | Open Tokopedia listing |
|---|---|
| `kotak-8x50x150.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-8mm-x-50mm-x-150mm-potongan-besi-baja-hitam-ss400-a36-custom-1730814520853169459 |
| `kotak-8x100x150.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-8mm-x-100mm-x-150mm-potongan-besi-baja-hitam-ss400-a36-custom-1730814363004470579 |
| `kotak-10x100x150.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-10mm-x-100mm-x-150mm-potongan-besi-baja-hitam-ss400-a36-custom-1730899790390592819 |
| `kotak-12x100x300.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-x-100mm-x-300mm-potongan-besi-baja-hitam-ss400-a36-custom-1730750148082566451 |
| `kotak-4x200x200.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-4mm-x-200mm-x-200mm-potongan-besi-baja-hitam-ss400-a36-custom-1731364659880297779 |
| `kotak-12-20x200x200.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-20mm-x-200mm-x-200mm-potongan-besi-baja-hitam-ss400-a36-custom-1730777323273225523 |
| `kotak-12-20x250x175.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-20mm-x-250mm-x-175mm-potongan-besi-baja-hitam-ss400-a36-custom-1730764814599030067 |
| `kotak-3x200x250.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-3mm-x-200mm-x-250mm-potongan-besi-baja-hitam-ss400-a36-custom-1730909747641353523 |
| `kotak-12-20x300x200.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-20mm-x-300mm-x-200mm-potongan-besi-baja-hitam-ss400-a36-custom-1730771931413841203 |
| `kotak-12x250x300.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-x-250mm-x-300mm-potongan-besi-baja-hitam-ss400-a36-custom-1730750023059998003 |
| `kotak-12-20x350x225.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-20mm-x-350mm-x-225mm-potongan-besi-baja-hitam-ss400-a36-custom-1730772420356375859 |
| `kotak-12x300x300.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-x-300mm-x300mm-potongan-besi-baja-hitam-ss400-a36-custom-1731899946168911155 |
| `kotak-12-20x300x300.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-20mm-x-300mm-x-300mm-potongan-besi-baja-hitam-ss400-a36-custom-1730777348008215859 |
| `kotak-12-20x400x250.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-20mm-x-400mm-x-250mm-potongan-besi-baja-hitam-ss400-a36-custom-1730777303741859123 |
| `kotak-12-20x350x350.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-20mm-x-350mm-x-350mm-potongan-besi-baja-hitam-ss400-a36-custom-1730777370804782387 |
| `kotak-12-20x600x300.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-kotak-12mm-20mm-x-600mm-x-300mm-potongan-besi-baja-hitam-ss400-a36-custom-1730777314625619251 |

### Plat Besi Bulat (9)

| Save as → | Open Tokopedia listing |
|---|---|
| `bulat-5x200.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-5mm-diameter-200mm-potongan-besi-baja-hitam-ss400-a36-custom-1730891228409201971 |
| `bulat-8x200.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-8mm-diameter-200mm-potongan-besi-baja-hitam-ss400-a36-custom-1730891217651795251 |
| `bulat-8x250.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-8mm-diameter-250mm-potongan-besi-baja-hitam-ss400-a36-custom-1730891196073936179 |
| `bulat-10x200.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-10mm-diameter-200mm-potongan-besi-baja-hitam-ss400-a36-custom-1730890371042215219 |
| `bulat-10x250.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-10mm-diameter-250mm-potongan-besi-baja-hitam-ss400-a36-custom-1730890408889451827 |
| `bulat-12x150.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-12mm-diameter-150mm-potongan-besi-baja-hitam-ss400-a36-custom-1730890468262184243 |
| `bulat-12x250.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-12mm-diameter-250mm-potongan-besi-baja-hitam-ss400-a36-custom-1730890467555181875 |
| `bulat-15-od200-id40.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-15mm-od-200mm-id-40mm-potongan-besi-baja-hitam-ss400-a36-custom-1731345024211518771 |
| `bulat-25x200.jpg` | https://www.tokopedia.com/buanawisesa/plat-besi-bulat-25mm-diameter-200mm-potongan-besi-baja-hitam-ss400-a36-custom-1730891222301836595 |

---

## Why not just direct download links?

Tokopedia's image CDN uses **signed URLs** with `x-expires` query parameters that invalidate after about an hour. I cannot generate static links that work tomorrow. The only way to get usable URLs is to grab them fresh from a browser session that has them (Method 1) or open each listing page (Method 2).

## What if Method 1 finds fewer than 25 products?

The script auto-scrolls to lazy-load all SKUs, but if your shop renders in a weird state, the console will warn you which filenames are missing. For those, fall back to Method 2.
