// Buana Wisesa catalog — shared renderer across index/kotak/bulat pages.
// Each page sets window.__CATEGORY__ = 'kotak' | 'bulat' | undefined (landing).
// Data source: products.json (or window.__PRODUCTS__ for file:// preview).

(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  // --- WhatsApp URL builder ---
  // Phone format MUST be international, digits only (no +, no spaces).
  function buildWhatsappUrl(phone, message) {
    return `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(message)}`;
  }

  function productMessage(shopName, skuMessage) {
    return `Halo ${shopName}, saya tertarik dengan ${skuMessage}. Mohon info harga & ketersediaan.`;
  }

  function customMessage(shopName, body) {
    return `Halo ${shopName}, ${body}. Terima kasih.`;
  }

  // --- WhatsApp SVG icon (small) ---
  const WA_ICON_SMALL = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z"/></svg>`;

  // --- Card renderer ---
  function renderProductCard(product, shop) {
    const a = document.createElement('a');
    a.className = 'product-card';
    a.href = buildWhatsappUrl(shop.whatsapp, productMessage(shop.name, product.skuMessage));
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', `Chat WhatsApp tentang ${product.name}`);

    const imgWrap = document.createElement('div');
    imgWrap.className = 'product-img-wrap';

    const img = document.createElement('img');
    img.className = 'product-img';
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      a.setAttribute('data-no-image', '');
    });
    imgWrap.appendChild(img);

    const placeholder = document.createElement('div');
    placeholder.className = 'product-img-placeholder';
    placeholder.textContent = product.name;
    imgWrap.appendChild(placeholder);

    a.appendChild(imgWrap);

    const body = document.createElement('div');
    body.className = 'product-body';

    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = product.name;
    body.appendChild(name);

    const cta = document.createElement('span');
    cta.className = 'product-cta';
    cta.innerHTML = `${WA_ICON_SMALL} Chat untuk harga`;
    body.appendChild(cta);

    a.appendChild(body);
    return a;
  }

  // --- Inject shop info into every page (hero, top bar, footer, custom CTA) ---
  function applyShopInfo(data) {
    const { shop, customOrder } = data;
    const customWaUrl = buildWhatsappUrl(
      shop.whatsapp,
      customMessage(shop.name, customOrder.skuMessage)
    );

    // Hero (index only)
    setText('#hero-meta', `${shop.location} · ${shop.responseHours}`);
    setText('#experience-badge', shop.experience);
    setText('#tagline', shop.tagline);
    setHref('#hero-cta', customWaUrl);
    setHref('#tokopedia-link', shop.tokopediaUrl);

    // Avatar — if shop.logoUrl loads, swap the "BW" circle for the real brand logo
    // and mark the hero so CSS lays out for a wide rectangular logo (not a circle)
    const avatar = document.getElementById('avatar');
    if (avatar && shop.logoUrl) {
      const probe = new Image();
      probe.onload = () => {
        avatar.innerHTML = '';
        const img = document.createElement('img');
        img.src = shop.logoUrl;
        img.alt = `${shop.name} logo`;
        img.decoding = 'async';
        avatar.appendChild(img);
        const hero = avatar.closest('.hero');
        if (hero) hero.setAttribute('data-has-logo', '');
      };
      probe.src = shop.logoUrl;
    }

    // Sticky top bar Chat shortcut
    setHref('#top-cta', customWaUrl);

    // Custom-order card CTA (every page)
    setHref('#custom-cta', customWaUrl);
    if (customOrder.buttonLabel) setText('#custom-cta-label', customOrder.buttonLabel);
    if (customOrder.title) setText('#custom-title', customOrder.title);

    // Footer
    setText('#footer-experience', shop.experience);
    setText('#footer-location', shop.location);
    setText('#footer-hours', `Jam balas: ${shop.responseHours}`);
    setHref('#footer-wa', buildWhatsappUrl(shop.whatsapp, customMessage(shop.name, 'saya ingin bertanya')));
    setHref('#footer-tokped', shop.tokopediaUrl);
    setText('#footer-year', String(new Date().getFullYear()));
  }

  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el && text != null) el.textContent = text;
  }
  function setHref(sel, href) {
    const el = document.querySelector(sel);
    if (el && href) el.href = href;
  }

  // --- Data loader: window.__PRODUCTS__ (preview) OR fetch products.json (prod) ---
  async function loadData() {
    if (window.__PRODUCTS__) return window.__PRODUCTS__;
    const res = await fetch('products.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load products.json: ${res.status}`);
    return await res.json();
  }

  // --- Boot ---
  async function init() {
    try {
      const data = await loadData();
      applyShopInfo(data);

      // Only catalog pages have a product grid. window.__CATEGORY__ tells us which.
      const wantedCategory = window.__CATEGORY__;
      if (!wantedCategory) return; // landing page — no products to render

      const category = data.categories.find((c) => c.id === wantedCategory);
      if (!category) {
        console.warn(`Category "${wantedCategory}" not found in products.json`);
        return;
      }

      const grid = document.querySelector(`.product-grid[data-category="${wantedCategory}"]`);
      if (!grid) return;

      grid.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (const product of category.products) {
        frag.appendChild(renderProductCard(product, data.shop));
      }
      grid.appendChild(frag);

      // Update subheader text from JSON
      const sub = document.getElementById('cat-subtitle');
      if (sub && category.subtitle) sub.textContent = `${category.subtitle} · Tap kartu untuk chat harga.`;
      const title = document.getElementById('cat-title');
      if (title && category.title) title.textContent = category.title;
    } catch (err) {
      console.error(err);
      const target = document.querySelector('.product-grid') || document.body;
      const errBox = document.createElement('div');
      errBox.className = 'error';
      errBox.textContent = `Gagal memuat katalog: ${err.message}. Coba refresh halaman.`;
      target.replaceWith(errBox);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
