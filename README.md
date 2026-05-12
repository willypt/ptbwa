# Buana Wisesa — Static Catalog Site

Multi-page catalog for Buana Wisesa (custom-cut plat besi SS400/A36). Every product card links to a WhatsApp chat with a SKU-specific prefilled message. No prices surfaced. Deploys on GitHub Pages.

Design: mobile-first, 2-column grid, lynk.id-inspired card style.

## Site structure

- **`index.html`** — landing page: hero (logo + bio + experience badge), 2 category tiles (Kotak / Bulat), custom-order CTA
- **`kotak.html`** — Plat Besi Kotak catalog (16 SKUs in a 2-column grid)
- **`bulat.html`** — Plat Besi Bulat catalog (9 SKUs in a 2-column grid)

Each catalog page sets `window.__CATEGORY__` in a `<script>` tag, which tells `script.js` which slice of `products.json` to render. One JSON, three pages, no duplication.

## File layout

```
buanawisesa-site/
├── index.html         ← landing page (deploy this)
├── kotak.html         ← Plat Kotak catalog page (deploy this)
├── bulat.html         ← Plat Bulat catalog page (deploy this)
├── styles.css         ← shared stylesheet (deploy this)
├── script.js          ← vanilla JS renderer (deploy this)
├── products.json      ← single source of truth: shop + 25 SKUs (deploy this)
├── preview.html       ← file:// preview, opens to landing (= preview-index.html)
├── preview-index.html ← file:// preview of landing
├── preview-kotak.html ← file:// preview of Kotak page
├── preview-bulat.html ← file:// preview of Bulat page
├── images/            ← put product photos here (see images/README.md)
│   └── README.md
├── CNAME.example      ← rename to "CNAME" and edit when you buy a domain
├── .nojekyll          ← tells GitHub Pages to skip Jekyll processing
└── README.md          ← this file
```

## Local preview

**Fastest — no server.** Double-click any `preview-*.html` in Finder; they have products inlined so they work via `file://`. The tile links between previews work too since they reference the regular `index.html` / `kotak.html` / `bulat.html` (which won't render without server — so for full tile-navigation testing use the server method below).

For pure visual review of layout/typography, `preview-index.html` shows the landing, `preview-kotak.html` shows the Kotak grid, etc. Do NOT deploy any `preview-*.html` — deploy the originals.

**Production-mirror preview — local server.** The deployed pages use `fetch('products.json')`, which requires a server:

```bash
cd buanawisesa-site
python3 -m http.server 8080
# → open http://localhost:8080
```

This is what GitHub Pages will look like — tile navigation, cross-page links, everything works.

**Regenerating previews** after editing `products.json` or any HTML:

```bash
python3 -c "
import pathlib
products = pathlib.Path('products.json').read_text()
inline = '<script>window.__PRODUCTS__ = ' + products + ';</script>\n  '
marker = '<script src=\"script.js\" defer></script>'
banner = '<!-- preview-*.html: products inlined for file:// preview. DO NOT deploy. -->\n'
for src in ('index.html', 'kotak.html', 'bulat.html'):
    html = pathlib.Path(src).read_text()
    out = banner + html.replace(marker, inline + marker)
    pathlib.Path('preview-' + src).write_text(out)
"
cp preview-index.html preview.html
```

## Editing content

Everything is data-driven. To change shop name, bio, WhatsApp number, or any product, edit `products.json` and reload — no build step.

Key fields:
- `shop.whatsapp` — international format, digits only: `6281574628698`
- `shop.tagline`, `shop.experience`, `shop.location` — surface on hero + footer
- `categories[].products[].skuMessage` — the exact text that appears in WhatsApp pre-fill

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
