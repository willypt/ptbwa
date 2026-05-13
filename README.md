# Buana Wisesa — Static Catalog Site

Static catalog + Google-Ads landing page for Buana Wisesa (custom-cut plat besi SS400). Every product card links to a WhatsApp chat with a SKU-specific prefilled message. No prices surfaced. Deploys on GitHub Pages.

Design: mobile-first. `index.html` is a long-form Google-Ads landing page (dark industrial hero, featured products, why-us, FAQ, sticky CTA). `kotak.html` and `bulat.html` are full-catalog deep-link pages.

## Site structure

- **`index.html`** — landing page: dark hero with logo + dual CTA (WhatsApp + tel), why-us, featured 4-of-each product grid, custom-order card, how-it-works, FAQ, sticky bottom CTA
- **`kotak.html`** — Plat Besi Kotak catalog (16 SKUs in a 2-column grid)
- **`bulat.html`** — Plat Besi Bulat catalog (9 SKUs in a 2-column grid)

Each catalog page sets `window.__CATEGORY__` in a `<script>` tag, which tells `script.js` which slice of `products.json` to render. The landing page renders both grids in "featured" mode (top 4 of each). One JSON, three pages, no duplication.

## File layout

```
buanawisesa-site/
├── index.html         ← landing page (deploy this — products inlined by build.sh)
├── kotak.html         ← Plat Kotak catalog (deploy this — products inlined by build.sh)
├── bulat.html         ← Plat Bulat catalog (deploy this — products inlined by build.sh)
├── styles.css         ← shared stylesheet (deploy this)
├── script.js          ← vanilla JS renderer (deploy this)
├── products.json      ← single source of truth: shop + 25 SKUs (deploy this)
├── build.sh           ← inlines products.json into the three HTML files (not deployed)
├── serve.sh           ← local dev server wrapper (not deployed)
├── images/            ← product photos (see images/README.md)
│   └── README.md
├── CNAME.example      ← rename to "CNAME" and edit when you buy a domain
├── .nojekyll          ← tells GitHub Pages to skip Jekyll processing
└── README.md          ← this file
```

## How rendering works (no Jekyll needed)

`products.json` is the single source of truth. `build.sh` reads it and injects `<script>window.__PRODUCTS__ = {...}</script>` into each HTML file, right before `script.js` loads. At runtime, `script.js` prefers the inlined data and only falls back to `fetch('products.json')` if the inline block isn't there.

Why this beats Jekyll for this project:
- No Ruby / gem dependencies — just `python3`, which ships with macOS
- No Liquid templating to learn — the source HTML is plain HTML
- Pages render statically on `file://` and on any host, not just a Jekyll-aware one
- `.nojekyll` stays in place so GitHub Pages skips its Jekyll build entirely

## Editing content

1. Edit `products.json` (shop info, products) or any HTML/CSS
2. Run `./build.sh` to re-inline products into the HTML files
3. Commit and push

The build is idempotent — re-running replaces the previous inlined block. The inlined block is wrapped in `<!-- BUILD:DATA -->...<!-- /BUILD:DATA -->` so you can spot it in diffs.

Key fields in `products.json`:
- `shop.whatsapp` — international format, digits only: `6281388313811`
- `shop.phone` — international with `+`: `+6281388313811` (used by `tel:` link)
- `shop.tagline`, `shop.experience`, `shop.location` — surface on hero + footer
- `categories[].products[].skuMessage` — the exact text that appears in the WhatsApp pre-fill

## Local development

```bash
./serve.sh           # serves on http://localhost:8000
./serve.sh 8080      # custom port
```

`serve.sh` just runs `python3 -m http.server` — no install required on macOS. After `./build.sh`, the pages also work on `file://` (double-click any HTML file in Finder).

Hot-reload isn't built in; refresh manually after edits.

## Step-by-step: ship to production

### 1. Add product photos to `images/`

Quickest path: open [`download-images.md`](download-images.md) and follow Method 1 — a browser console snippet that grabs all 25 image URLs in one shot and gives you a single Terminal command to download them all with correct filenames (~60 seconds total).

Without photos the site still works (cards show striped placeholder + product name), but it looks much better with photos.

### 2. Create a GitHub repository

```bash
cd buanawisesa-site
git init
git add .
git commit -m "initial commit"
gh repo create buanawisesa-catalog --public --source=. --push
```

If you don't have the `gh` CLI: create the repo manually on github.com, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/buanawisesa-catalog.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Build and deployment** → **Source**: pick **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)` → **Save**
4. Wait ~1 minute. The site goes live at `https://YOUR_USERNAME.github.io/buanawisesa-catalog/`

You should see a green checkmark when ready.

### 4. (Optional) Custom domain

Buy a domain. Options:

- **.id (Indonesian)** — Niagahoster, Domainesia, Rumahweb. Ballpark Rp 150-300k/year. `.co.id` needs business documents; `.id` is open. Verify current pricing before buying.
- **.com** — Namecheap, Cloudflare Registrar, Porkbun. ~$10-15/year.

Then:

1. Rename `CNAME.example` to `CNAME` (no extension), and put only your domain in it (e.g., `buanawisesa.id`). Commit + push.
2. In your repo → **Settings** → **Pages** → **Custom domain** → enter the same domain → **Save**.
3. At your registrar's DNS panel, add the following records:

| Type | Host | Value |
|---|---|---|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |
| CNAME | www | `YOUR_USERNAME.github.io` |

These IPs are GitHub Pages' standard apex domain IPs (verify in [GitHub Pages docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) before relying on them — they're stable but change every few years).

4. Wait for DNS propagation (10 min to 48 hours). GitHub will show "DNS check successful" and auto-provision Let's Encrypt cert.
5. Enable **Enforce HTTPS** once available.

### 5. Verify before sharing

On your phone (not desktop), open the site and:
- Tap **any product card** → confirm WhatsApp opens with prefilled "Halo Buana Wisesa, saya tertarik dengan [SKU]..."
- Tap the **hero Custom Order button** → confirm prefill includes `[plat / pipa / as / strip / WF / UNP]` template
- Confirm photos load and look reasonable on a small screen

## What this site doesn't have (yet)

- Analytics (add Plausible/Umami snippet to `<head>` if needed; both have free tiers)
- Search / filter by dimension (data is in JSON, easy to add later)
- Multiple language support
- Form submissions (would require a backend)

All trivial to add when you actually need them. The data shape in `products.json` is the foundation.

## What if I want to update prices someday?

You said no prices today. If that changes, add a `price` field to each product in `products.json` and uncomment a `data-price` render line in `script.js` (or just add the price display where the "Chat untuk harga" line is). No other code changes needed.
