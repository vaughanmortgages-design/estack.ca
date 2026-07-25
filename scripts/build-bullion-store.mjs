import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url).pathname;

const categories = [
  ['gold-bars', 'Gold Bars', 'Investment-grade bars across practical weights and formats.', 'AU'],
  ['gold-coins', 'Gold Coins', 'Recognized bullion coins and collectible issues.', 'GC'],
  ['silver-bars', 'Silver Bars', 'Stackable silver formats for varied budgets.', 'AG'],
  ['silver-coins', 'Silver Coins', 'Sovereign bullion coins and limited releases.', 'SC'],
  ['platinum', 'Platinum', 'Bars and coins from established refiners and mints.', 'PT'],
  ['palladium', 'Palladium', 'A focused category for this scarce precious metal.', 'PD'],
  ['copper', 'Copper', 'Accessible rounds and bars for collectors.', 'CU'],
  ['vault-products', 'Vault Products', 'Storage-oriented formats and ownership education.', 'VT'],
  ['collectibles', 'Collectibles', 'Numismatic and limited-edition pieces worth exploring.', 'CO'],
  ['deals', 'Deals', 'Verified dealer opportunities when live inventory arrives.', 'DL']
];

const dealers = [
  {
    id: 'money-metals-exchange',
    name: 'Money Metals Exchange',
    badge: 'MME',
    description: 'Precious metals dealer and educational resource.',
    categories: ['gold-bars', 'gold-coins', 'silver-bars', 'silver-coins', 'platinum', 'copper']
  },
  {
    id: 'kitco',
    name: 'Kitco',
    badge: 'K',
    description: 'Bullion marketplace and precious metals market information.',
    categories: ['gold-bars', 'gold-coins', 'silver-bars', 'silver-coins', 'platinum', 'palladium']
  },
  {
    id: 'sprott-money',
    name: 'Sprott Money',
    badge: 'SM',
    description: 'Canadian precious metals dealer and market education source.',
    categories: ['gold-bars', 'gold-coins', 'silver-bars', 'silver-coins', 'platinum']
  }
];

const ticker = `<div class="ticker" aria-label="Live market ticker"><div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div><script src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>{"symbols":[{"proName":"TVC:GOLD","title":"Gold"},{"proName":"TVC:SILVER","title":"Silver"},{"proName":"TVC:PLATINUM","title":"Platinum"},{"proName":"TVC:PALLADIUM","title":"Palladium"},{"proName":"FX_IDC:USDCAD","title":"USD/CAD"}],"showSymbolLogo":true,"colorTheme":"dark","isTransparent":true,"displayMode":"adaptive","locale":"en"}</script></div></div>`;

const header = `${ticker}<header class="store-header"><div class="store-shell store-nav"><a class="store-logo" href="/" aria-label="eStack Bullion home">e<span>Stack</span><small>BULLION</small></a><button class="store-menu" type="button" aria-expanded="false" aria-controls="store-navigation">Menu</button><nav id="store-navigation" class="store-links" aria-label="Primary navigation"><a href="/shop/">Shop</a><a href="/shop/gold-bars/">Gold</a><a href="/shop/silver-bars/">Silver</a><a href="/shop/platinum/">Platinum</a><a href="/shop/collectibles/">Collectibles</a><a href="/markets.html">Spot Prices</a><a href="/bullion.html">Learn</a></nav></div></header>`;

const social = `<nav class="social-links" aria-label="Follow eStack.ca"><a class="social-link" href="https://www.instagram.com/estack_ca/" target="_blank" rel="noopener noreferrer" aria-label="Follow eStack.ca on Instagram">IG</a><a class="social-link" href="https://www.facebook.com/profile.php?id=61591552108308" target="_blank" rel="noopener noreferrer" aria-label="Follow eStack.ca on Facebook">FB</a><a class="social-link" href="https://ca.pinterest.com/estackca/" target="_blank" rel="noopener noreferrer" aria-label="Follow eStack.ca on Pinterest">PI</a><a class="social-link" href="https://www.linkedin.com/company/132324208/" target="_blank" rel="noopener noreferrer" aria-label="Follow eStack.ca on LinkedIn">LI</a><a class="social-link" href="https://www.youtube.com/@eStackCA" target="_blank" rel="noopener noreferrer" aria-label="Follow eStack.ca on YouTube">YT</a></nav>`;

const footer = `<footer class="store-footer"><div class="store-shell footer-grid"><div><a class="store-logo" href="/">e<span>Stack</span><small>BULLION</small></a><p>A premium Canadian guide to precious metals dealers, market data and bullion education.</p>${social}</div><div><h2>Marketplace</h2><a href="/shop/">All categories</a><a href="/shop/gold-bars/">Gold</a><a href="/shop/silver-bars/">Silver</a><a href="/shop/collectibles/">Collectibles</a></div><div><h2>Information</h2><a href="/bullion.html">Bullion guides</a><a href="/markets.html">Market dashboard</a><a href="/partner-directory.html">Dealer directory</a><a href="/affiliate-disclosure.html">Affiliate disclosure</a></div></div><div class="store-shell fine-print"><p>Prices, availability and dealer terms are not displayed until verified inventory data is available. Precious metals can fluctuate in value. Information is general and is not financial, investment, legal or tax advice.</p></div></footer>`;

const categoryCards = categories.map(([slug, title, description, mark]) =>
  `<a class="category-card" href="/shop/${slug}/"><span class="metal-mark">${mark}</span><span><strong>${title}</strong><small>${description}</small></span><span class="arrow" aria-hidden="true">↗</span></a>`
).join('');

function head({ title, description, canonical, type = 'website' }) {
  const image = 'https://estack.ca/assets/estack-bullion-og.svg';
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="${type}"><meta property="og:site_name" content="eStack Bullion"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}"><meta name="theme-color" content="#060606"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/bullion-store.css"><link rel="stylesheet" href="/assets/social.css">`;
}

function document({ pageClass = '', headContent, main, schema = '' }) {
  return `<!doctype html><html lang="en-CA"><head>${headContent}${schema}</head><body class="${pageClass}">${header}<main>${main}</main>${footer}<script type="module" src="/assets/bullion-store.js"></script><script src="https://www.dwin2.com/pub.2936205.min.js"></script></body></html>`;
}

const homeSchema = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'eStack Bullion',
  url: 'https://estack.ca/',
  description: 'Canadian precious metals marketplace and bullion publication.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://estack.ca/shop/?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
})}</script>`;

const homepage = document({
  pageClass: 'home-page',
  headContent: head({
    title: 'eStack Bullion | Premium Precious Metals Marketplace Canada',
    description: 'Explore gold, silver, platinum, palladium, collectibles, live spot prices and trusted precious metals dealers in Canada.',
    canonical: 'https://estack.ca/'
  }),
  schema: homeSchema,
  main: `<section class="hero"><div class="store-shell hero-grid"><div class="hero-copy"><span class="eyebrow">Canadian precious metals marketplace</span><h1>Own something <em>timeless.</em></h1><p>Explore gold, silver and rare metals through a refined marketplace built around trusted dealers, transparent market context and useful buying guides.</p><div class="hero-actions"><a class="button gold" href="/shop/">Explore the marketplace</a><a class="button ghost" href="/markets.html">View spot prices</a></div><div class="trust-row"><span>Verified dealer network</span><span>Live market context</span><span>Clear disclosures</span></div></div><div class="hero-art" aria-hidden="true"><div class="coin coin-back"></div><div class="coin coin-front"><span>eS</span><small>FINE BULLION</small></div><div class="market-card"><small>MARKET ACCESS</small><strong>Gold · Silver · Platinum</strong><span>Live spot data appears above</span></div></div></div></section>
  <section class="store-section" id="deals"><div class="store-shell"><div class="section-head"><div><span class="eyebrow">Curated opportunity</span><h2>Today’s Bullion Deals</h2></div><p>Product feeds are being prepared. Until verified inventory is connected, browse the categories where live dealer offers will appear.</p></div><div class="deal-grid"><a class="deal-card gold-wash" href="/shop/gold-bars/"><span>01</span><h3>Gold essentials</h3><p>Bars and coins organized for clear comparison.</p><strong>Explore gold →</strong></a><a class="deal-card silver-wash" href="/shop/silver-bars/"><span>02</span><h3>Silver opportunities</h3><p>Flexible formats across recognized categories.</p><strong>Explore silver →</strong></a><a class="deal-card dark-wash" href="/shop/deals/"><span>03</span><h3>Verified deals</h3><p>No invented savings. Offers appear only after data verification.</p><strong>View deals →</strong></a></div></div></section>
  <section class="store-section pale" id="dealers"><div class="store-shell"><div class="section-head"><div><span class="eyebrow">Dealer network</span><h2>Featured Dealers</h2></div><a class="text-link" href="/partner-directory.html">View dealer directory →</a></div><div class="dealer-grid" data-dealer-grid><noscript>Enable JavaScript to load dealer profiles.</noscript></div></div></section>
  <section class="store-section"><div class="store-shell"><div class="section-head"><div><span class="eyebrow">The metals</span><h2>Build your collection.</h2></div><p>Move from broad metal categories to focused formats without clutter or unsupported product claims.</p></div><div class="metal-grid">${categories.slice(0, 7).map(([slug, title, description, mark]) => `<a href="/shop/${slug}/" class="metal-card"><span>${mark}</span><h3>${title.replace(/ (Bars|Coins)$/, '')}</h3><p>${description}</p></a>`).join('')}</div></div></section>
  <section class="spot-section"><div class="store-shell spot-grid"><div><span class="eyebrow">Live market context</span><h2>Spot Prices</h2><p>Follow live or near-live precious metals data through the existing TradingView market tools. No prices are hard-coded.</p><a class="button gold" href="/markets.html">Open market dashboard</a></div><div class="spot-panel"><span>GOLD</span><span>SILVER</span><span>PLATINUM</span><span>PALLADIUM</span><small>Live data supplied by TradingView</small></div></div></section>
  <section class="store-section"><div class="store-shell"><div class="section-head"><div><span class="eyebrow">Editorial intelligence</span><h2>Latest Bullion News & Guides</h2></div><a class="text-link" href="/bullion.html">All bullion guides →</a></div><div class="editorial-grid"><a href="/buy-gold-bullion-canada.html"><span>Buying guide</span><h3>How to buy gold bullion in Canada</h3><p>Understand formats, premiums, dealer considerations and secure ownership.</p></a><a href="/gold-vs-silver-bullion-canada-2026.html"><span>Comparison</span><h3>Gold versus silver</h3><p>A practical look at liquidity, premiums, storage and portfolio roles.</p></a><a href="/kitco-hub.html"><span>Market resources</span><h3>Follow the bullion market</h3><p>Use live data and dealer information without relying on static price claims.</p></a></div></div></section>`
});

const shopSchema = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Bullion Shop Categories',
  url: 'https://estack.ca/shop/',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: categories.map(([slug, title], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: title,
      url: `https://estack.ca/shop/${slug}/`
    }))
  }
})}</script>`;

const shop = document({
  pageClass: 'shop-page',
  headContent: head({
    title: 'Shop Bullion by Category | eStack Bullion',
    description: 'Browse gold bars, gold coins, silver, platinum, palladium, copper, vault products, collectibles and verified bullion deals.',
    canonical: 'https://estack.ca/shop/'
  }),
  schema: shopSchema,
  main: `<section class="page-hero"><div class="store-shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Shop</span></nav><span class="eyebrow">The marketplace</span><h1>Explore bullion by category.</h1><p>Choose a focused collection. Product feeds and verified pricing will appear here only after dealer data is connected.</p></div></section><section class="store-section"><div class="store-shell"><div class="category-grid">${categoryCards}</div></div></section><section class="store-section pale"><div class="store-shell editorial-callout"><div><span class="eyebrow">Before you buy</span><h2>Compare the metal, format and dealer—not only the headline price.</h2></div><a class="button dark" href="/bullion.html">Read bullion guides</a></div></section>`
});

const igSchema = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'eStack Bullion Social Storefront',
  url: 'https://estack.ca/ig/',
  description: 'Mobile-first precious metals collections for eStack.ca social visitors.',
  isPartOf: {'@type': 'WebSite', name: 'eStack Bullion', url: 'https://estack.ca/'}
})}</script>`;

const ig = document({
  pageClass: 'ig-page',
  headContent: head({
    title: 'Shop Bullion from eStack Social | Gold, Silver & Collectibles',
    description: 'A fast, mobile-first bullion storefront for eStack.ca visitors from Instagram, Facebook, Pinterest and TikTok.',
    canonical: 'https://estack.ca/ig/'
  }),
  schema: igSchema,
  main: `<section class="ig-hero"><div class="ig-shell"><span class="ig-kicker">eStack social storefront</span><h1>Precious metals.<br><em>One clean feed.</em></h1><p>Browse focused bullion collections, trusted dealer badges and verified offers as they become available.</p><a class="button gold" href="#ig-shop">Start shopping</a></div></section>
  <section class="ig-tools" id="ig-shop"><div class="ig-shell"><form class="ig-search" role="search" data-product-search><label for="ig-product-search">Search the storefront</label><div><input id="ig-product-search" name="q" type="search" placeholder="Search gold, silver, dealers…" autocomplete="off"><button type="submit">Search</button></div></form><div class="filter-row" aria-label="Filter by collection" data-filter-row><button type="button" class="active" data-filter="all">All</button>${['gold', 'silver', 'platinum', 'palladium', 'collectibles', 'deals'].map(name => `<button type="button" data-filter="${name}">${name[0].toUpperCase() + name.slice(1)}</button>`).join('')}</div></div></section>
  <section class="ig-section"><div class="ig-shell"><div class="ig-heading"><span>Featured</span><h2>Featured Deals</h2><div class="carousel-controls"><button type="button" data-carousel-prev aria-label="Previous featured deals">←</button><button type="button" data-carousel-next aria-label="Next featured deals">→</button></div></div><div class="ig-carousel" data-featured-carousel><div class="ig-feed-empty"><strong>Verified deals are being prepared.</strong><span>No unverified prices or links will be shown.</span></div></div></div></section>
  <section class="ig-section ig-dark"><div class="ig-shell"><div class="ig-heading"><span>Updated feed</span><h2>Today’s Bullion Deals</h2></div><div class="ig-product-grid" data-ig-product-grid><div class="ig-feed-empty"><strong>Dealer inventory is connecting.</strong><span>Product cards will load here automatically from JSON.</span></div></div></div></section>
  <section class="ig-section"><div class="ig-shell"><div class="ig-heading"><span>Collections</span><h2>Shop by Metal</h2></div><div class="ig-collection-grid"><a href="/shop/gold-bars/"><span>AU</span><strong>Gold</strong><small>Bars & coins</small></a><a href="/shop/silver-bars/"><span>AG</span><strong>Silver</strong><small>Bars & coins</small></a><a href="/shop/platinum/"><span>PT</span><strong>Platinum</strong><small>Focused collection</small></a><a href="/shop/palladium/"><span>PD</span><strong>Palladium</strong><small>Scarce metal</small></a><a href="/shop/collectibles/"><span>CO</span><strong>Collectibles</strong><small>Limited pieces</small></a><a href="/shop/deals/"><span>DL</span><strong>Deals</strong><small>Verified offers</small></a></div></div></section>
  <section class="ig-section ig-paper"><div class="ig-shell"><div class="ig-heading"><span>Dealer network</span><h2>Shop by Dealer</h2></div><div class="ig-dealer-list" data-ig-dealer-list><noscript>Enable JavaScript to load dealer badges.</noscript></div></div></section>
  <div class="ig-sticky"><a href="#ig-shop">Shop bullion</a></div>`
});

function categoryPage([slug, title, description, mark]) {
  const canonical = `https://estack.ca/shop/${slug}/`;
  const schema = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Home', item: 'https://estack.ca/'},
          {'@type': 'ListItem', position: 2, name: 'Shop', item: 'https://estack.ca/shop/'},
          {'@type': 'ListItem', position: 3, name: title, item: canonical}
        ]
      },
      {
        '@type': 'CollectionPage',
        name: title,
        url: canonical,
        description
      }
    ]
  })}</script>`;
  const related = categories.filter(([other]) => other !== slug).slice(0, 3)
    .map(([other, otherTitle]) => `<a href="/shop/${other}/">${otherTitle}<span>→</span></a>`).join('');
  return document({
    pageClass: 'category-page',
    headContent: head({
      title: `${title} in Canada | eStack Bullion`,
      description: `${description} Browse the category foundation and dealer-ready marketplace at eStack Bullion.`,
      canonical
    }),
    schema,
    main: `<section class="page-hero category-hero"><div class="store-shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop/">Shop</a><span>/</span><span>${title}</span></nav><div class="category-title"><span class="hero-mark">${mark}</span><div><span class="eyebrow">Bullion collection</span><h1>${title}</h1><p>${description}</p></div></div></div></section><section class="store-section"><div class="store-shell"><div class="section-head"><div><span class="eyebrow">Inventory foundation</span><h2>${title} marketplace</h2></div><p>Dealer inventory is not connected yet. Products and verified pricing will load here from JSON without changing this page.</p></div><div class="product-grid" data-product-grid data-category="${slug}"></div><div class="empty-state" data-empty-state><span>${mark}</span><h3>Curated products are coming soon.</h3><p>We will publish products only after the title, dealer, image, price and destination are verified.</p><a class="button dark" href="/shop/">Browse all categories</a></div></div></section><section class="store-section pale"><div class="store-shell"><div class="section-head"><div><span class="eyebrow">Continue exploring</span><h2>Related collections</h2></div></div><div class="related-row">${related}</div></div></section>`
  });
}

const css = `
:root{--ink:#090909;--charcoal:#151515;--gold:#c49a43;--gold-light:#ead19a;--paper:#f7f5ef;--white:#fff;--muted:#696969;--line:rgba(12,12,12,.12);--radius:24px;--shadow:0 24px 70px rgba(0,0,0,.12)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--white);color:var(--ink);font-family:"DM Sans",sans-serif;line-height:1.6}a{color:inherit;text-decoration:none}button{font:inherit}.store-shell{width:min(1180px,calc(100% - 40px));margin:auto}.ticker{min-height:46px;background:#030303;border-bottom:1px solid rgba(196,154,67,.25)}.store-header{position:sticky;top:0;z-index:50;background:rgba(8,8,8,.94);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.08)}.store-nav{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:24px}.store-logo{font:800 25px/1 "Manrope",sans-serif;color:#fff;letter-spacing:-.04em}.store-logo span{color:var(--gold-light)}.store-logo small{display:block;font-size:9px;letter-spacing:.32em;margin-top:6px;color:#aaa}.store-links{display:flex;align-items:center;gap:25px}.store-links a{color:#ddd;font-size:14px;font-weight:600}.store-links a:hover,.store-links a:focus-visible{color:var(--gold-light)}.store-menu{display:none;color:#fff;background:transparent;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:9px 13px}
.hero{overflow:hidden;background:radial-gradient(circle at 78% 32%,rgba(196,154,67,.19),transparent 27%),linear-gradient(135deg,#050505,#13110d 68%,#050505);color:#fff}.hero-grid{min-height:690px;display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;padding:80px 0}.eyebrow{display:block;color:#9a742e;font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;margin-bottom:14px}.hero .eyebrow,.spot-section .eyebrow{color:var(--gold-light)}h1,h2,h3{font-family:"Manrope",sans-serif;line-height:1.08;margin:0}.hero h1{font-size:clamp(54px,7vw,92px);letter-spacing:-.065em;max-width:700px}.hero h1 em{font-style:normal;color:var(--gold-light)}.hero-copy>p{max-width:660px;color:#c8c8c8;font-size:19px;margin:24px 0 30px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.button{display:inline-flex;min-height:50px;align-items:center;justify-content:center;border-radius:999px;padding:0 23px;font-weight:800;font-size:14px}.button.gold{background:linear-gradient(135deg,#e8cc8a,#b88731);color:#090909}.button.ghost{border:1px solid rgba(255,255,255,.25);color:#fff}.button.dark{background:#111;color:#fff}.button:hover,.button:focus-visible{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.18)}.trust-row{display:flex;gap:20px;flex-wrap:wrap;margin-top:30px;color:#a9a9a9;font-size:12px}.trust-row span:before{content:"◆";font-size:8px;color:var(--gold);margin-right:8px}.hero-art{position:relative;min-height:520px}.coin{position:absolute;border-radius:50%;aspect-ratio:1;box-shadow:0 30px 100px rgba(0,0,0,.55),inset 0 0 0 3px rgba(255,255,255,.28),inset 0 0 0 14px rgba(79,51,10,.18)}.coin-front{width:345px;right:35px;top:70px;display:grid;place-content:center;text-align:center;background:radial-gradient(circle at 32% 25%,#fff1bd,#c18e32 38%,#70501d 72%,#e7c878);border:3px solid #e3c477;color:#241805;transform:rotate(8deg)}.coin-front:after{content:"";position:absolute;inset:24px;border:1px dashed rgba(44,30,5,.4);border-radius:50%}.coin-front span{font:800 84px/1 "Manrope";letter-spacing:-.09em}.coin-front small{font-weight:800;letter-spacing:.18em}.coin-back{width:290px;left:0;top:10px;background:radial-gradient(circle at 30% 25%,#fafafa,#9e9e9e 48%,#424242 85%,#c9c9c9);filter:brightness(.75);transform:rotate(-14deg)}.market-card{position:absolute;right:0;bottom:8px;width:270px;padding:22px;border-radius:18px;background:rgba(16,16,16,.84);border:1px solid rgba(234,209,154,.35);backdrop-filter:blur(16px);box-shadow:var(--shadow)}.market-card small,.market-card span{display:block;color:#999}.market-card strong{display:block;margin:6px 0;color:#fff}
.store-section{padding:96px 0}.store-section.pale{background:var(--paper)}.section-head{display:flex;justify-content:space-between;align-items:end;gap:40px;margin-bottom:38px}.section-head h2,.spot-grid h2{font-size:clamp(34px,4.2vw,55px);letter-spacing:-.045em}.section-head p{max-width:560px;color:var(--muted);margin:0}.text-link{font-weight:800;border-bottom:1px solid var(--gold)}.deal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.deal-card{min-height:290px;padding:30px;border-radius:var(--radius);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;box-shadow:var(--shadow)}.deal-card>span{position:absolute;top:24px;right:26px;font:700 50px/1 "Manrope";opacity:.15}.deal-card h3{font-size:27px}.deal-card p{margin:10px 0 22px;color:#4d4d4d}.deal-card strong{font-size:14px}.gold-wash{background:linear-gradient(145deg,#f8e9bf,#c99a3e)}.silver-wash{background:linear-gradient(145deg,#fff,#b8bec5)}.dark-wash{background:linear-gradient(145deg,#171717,#050505);color:#fff}.dark-wash p{color:#aaa}.dealer-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.dealer-card{padding:28px;background:#fff;border:1px solid var(--line);border-radius:var(--radius);box-shadow:0 14px 45px rgba(0,0,0,.07)}.dealer-badge{width:56px;height:56px;border-radius:16px;background:#111;color:var(--gold-light);display:grid;place-items:center;font:800 16px "Manrope";margin-bottom:22px}.dealer-card h3{font-size:22px}.dealer-card p{color:var(--muted)}.dealer-card small{font-weight:800;color:#8c6927}.metal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.metal-card{padding:25px;border:1px solid var(--line);border-radius:20px;transition:.25s}.metal-card:hover,.metal-card:focus-visible{transform:translateY(-5px);border-color:var(--gold);box-shadow:var(--shadow)}.metal-card>span{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#111;color:var(--gold-light);font-weight:800}.metal-card h3{font-size:21px;margin-top:28px}.metal-card p{color:var(--muted);font-size:14px}.spot-section{background:#080808;color:#fff;padding:90px 0}.spot-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.spot-grid p{color:#aaa;max-width:560px;margin:18px 0 26px}.spot-panel{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12);border-radius:22px;overflow:hidden}.spot-panel span{padding:30px;background:#111;font-weight:800;color:var(--gold-light)}.spot-panel small{grid-column:1/-1;padding:14px 30px;background:#0b0b0b;color:#888}.editorial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.editorial-grid a{padding:30px;border-top:2px solid #111;background:var(--paper);min-height:245px}.editorial-grid span{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#8c6927;font-weight:800}.editorial-grid h3{font-size:24px;margin:50px 0 10px}.editorial-grid p{color:var(--muted)}
.page-hero{background:linear-gradient(135deg,#080808,#1a160f);color:#fff;padding:78px 0 88px}.page-hero h1{font-size:clamp(44px,6vw,76px);letter-spacing:-.055em;max-width:900px}.page-hero p{font-size:18px;color:#bbb;max-width:720px}.breadcrumbs{display:flex;gap:10px;color:#aaa;font-size:13px;margin-bottom:55px}.breadcrumbs a:hover,.breadcrumbs a:focus-visible{color:var(--gold-light)}.category-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.category-card{display:grid;grid-template-columns:auto 1fr auto;gap:20px;align-items:center;padding:24px;border:1px solid var(--line);border-radius:18px;transition:.2s}.category-card:hover,.category-card:focus-visible{background:#0b0b0b;color:#fff;border-color:#0b0b0b}.metal-mark{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#ead59e,#a77723);color:#171006;font-weight:800}.category-card strong,.category-card small{display:block}.category-card strong{font:800 20px "Manrope"}.category-card small{color:var(--muted);margin-top:4px}.category-card:hover small{color:#aaa}.arrow{font-size:22px}.editorial-callout{display:flex;align-items:center;justify-content:space-between;gap:40px}.editorial-callout h2{font-size:clamp(28px,4vw,48px);max-width:850px}.category-title{display:flex;gap:30px;align-items:center}.hero-mark{flex:0 0 110px;height:110px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#f2dfad,#a67828);color:#181006;font:800 31px "Manrope"}.product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.product-card{border:1px solid var(--line);border-radius:20px;overflow:hidden;background:#fff}.product-image{aspect-ratio:4/3;background:#eee;display:grid;place-items:center}.product-image img{width:100%;height:100%;object-fit:cover}.product-body{padding:22px}.product-body h3{font-size:20px}.product-meta{display:flex;justify-content:space-between;gap:10px;margin:12px 0;color:var(--muted)}.dealer-pill{font-size:11px;font-weight:800;padding:5px 9px;border-radius:999px;background:#111;color:var(--gold-light)}.price-placeholder{font-weight:800}.product-cta{display:block;text-align:center;padding:12px;border-radius:999px;background:#111;color:#fff;font-weight:800}.empty-state{text-align:center;padding:72px 24px;border:1px dashed rgba(0,0,0,.2);border-radius:var(--radius);background:var(--paper)}.empty-state>span{display:grid;place-items:center;width:70px;height:70px;border-radius:50%;margin:0 auto 18px;background:#111;color:var(--gold-light);font-weight:800}.empty-state h3{font-size:28px}.empty-state p{color:var(--muted);max-width:600px;margin:12px auto 24px}.related-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.related-row a{display:flex;justify-content:space-between;padding:22px;border-bottom:1px solid #bcb7a9;font-weight:800}
.store-footer{background:#050505;color:#aaa;padding:70px 0 28px}.footer-grid{display:grid;grid-template-columns:1.4fr .7fr .7fr;gap:60px}.footer-grid>div:first-child p{max-width:520px}.footer-grid h2{font-size:14px;color:#fff;margin-bottom:18px}.footer-grid>div>a:not(.store-logo){display:block;margin:9px 0}.store-footer .social-links{display:flex;gap:8px;margin-top:22px}.store-footer .social-link{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(255,255,255,.15);border-radius:50%;font-size:11px;color:#fff}.store-footer .social-link:hover,.store-footer .social-link:focus-visible{background:var(--gold);color:#080808}.fine-print{border-top:1px solid rgba(255,255,255,.1);margin-top:45px;padding-top:22px;font-size:12px}
.ig-page{background:#080808}.ig-page .store-header{position:relative}.ig-page main{background:#fff}.ig-shell{width:min(760px,calc(100% - 28px));margin:auto}.ig-hero{background:radial-gradient(circle at 78% 18%,rgba(231,195,115,.2),transparent 28%),linear-gradient(150deg,#050505,#17120a);color:#fff;padding:70px 0 76px;text-align:center}.ig-kicker{color:var(--gold-light);font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}.ig-hero h1{font-size:clamp(46px,12vw,74px);letter-spacing:-.065em;margin:18px 0}.ig-hero h1 em{font-style:normal;color:var(--gold-light)}.ig-hero p{max-width:590px;margin:0 auto 28px;color:#bbb;font-size:17px}.ig-tools{background:#fff;padding:28px 0 12px;position:sticky;top:0;z-index:20;border-bottom:1px solid var(--line)}.ig-search label{display:block;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:9px}.ig-search>div{display:flex;border:1px solid #cfcfcf;border-radius:999px;overflow:hidden}.ig-search input{flex:1;min-width:0;border:0;padding:14px 18px;font:inherit;outline:0}.ig-search button{border:0;background:#111;color:#fff;padding:0 20px;font-weight:800}.filter-row{display:flex;gap:8px;overflow-x:auto;padding:15px 0 4px;scrollbar-width:none}.filter-row button{white-space:nowrap;border:1px solid #d9d9d9;background:#fff;border-radius:999px;padding:9px 14px;text-transform:capitalize;font-size:12px;font-weight:800}.filter-row button.active{background:#111;color:#fff;border-color:#111}.ig-section{padding:58px 0}.ig-section.ig-dark{background:#0a0a0a;color:#fff}.ig-section.ig-paper{background:var(--paper)}.ig-heading{display:grid;grid-template-columns:1fr auto;align-items:end;margin-bottom:24px}.ig-heading>span{grid-column:1/-1;color:#95702c;font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.ig-heading h2{font-size:clamp(30px,8vw,46px);letter-spacing:-.05em}.carousel-controls{display:flex;gap:7px}.carousel-controls button{width:40px;height:40px;border-radius:50%;border:1px solid #ccc;background:#fff}.ig-carousel{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}.ig-carousel .ig-product-card{flex:0 0 min(82vw,330px);scroll-snap-align:start}.ig-feed-empty{width:100%;min-height:175px;border:1px dashed #aaa;border-radius:22px;display:grid;place-content:center;text-align:center;padding:24px}.ig-feed-empty strong,.ig-feed-empty span{display:block}.ig-feed-empty span{color:#777;margin-top:6px}.ig-dark .ig-feed-empty{border-color:#444}.ig-dark .ig-feed-empty span{color:#999}.ig-product-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.ig-product-card{background:#fff;color:#111;border:1px solid var(--line);border-radius:20px;overflow:hidden}.ig-square-image{aspect-ratio:1;background:radial-gradient(circle at 35% 30%,#f5e7bc,#ba8730 48%,#4d3510);display:grid;place-items:center;overflow:hidden}.ig-square-image img{width:100%;height:100%;object-fit:cover}.ig-square-image span{font:800 60px "Manrope";color:#241805}.ig-product-body{padding:18px}.ig-product-body h3{font-size:18px;margin:12px 0 8px}.ig-product-body p{font-size:13px;color:#666;line-height:1.5}.ig-shop-button{display:block;background:#111;color:#fff;border-radius:999px;text-align:center;padding:11px;font-size:13px;font-weight:800;margin-top:15px}.ig-shop-button[aria-disabled=true]{background:#dedede;color:#666}.ig-collection-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ig-collection-grid a{min-height:180px;padding:22px;border-radius:20px;background:#0b0b0b;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}.ig-collection-grid a>span{margin-bottom:auto;width:45px;height:45px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#efdaa5,#a67420);color:#211605;font-weight:800}.ig-collection-grid strong{font:800 22px "Manrope"}.ig-collection-grid small{color:#999}.ig-dealer-list{display:grid;gap:10px}.ig-dealer-list button{width:100%;display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;text-align:left;padding:14px;border:1px solid #d8d3c8;border-radius:17px;background:#fff}.ig-dealer-list button>span:nth-child(2) strong,.ig-dealer-list button>span:nth-child(2) small{display:block}.ig-dealer-list button>span:nth-child(2) small{color:#777}.ig-sticky{position:fixed;left:12px;right:12px;bottom:12px;z-index:60;display:none}.ig-sticky a{display:block;background:linear-gradient(135deg,#e8cc8a,#b88731);color:#080808;border-radius:999px;text-align:center;padding:15px;font-weight:900;box-shadow:0 14px 40px rgba(0,0,0,.3)}
@media(max-width:900px){.store-links{display:none;position:absolute;left:0;right:0;top:100%;padding:22px;background:#090909;flex-direction:column;align-items:flex-start}.store-links.open{display:flex}.store-menu{display:block}.hero-grid,.spot-grid{grid-template-columns:1fr}.hero-grid{padding:64px 0}.hero-art{min-height:410px}.coin-front{width:280px}.coin-back{width:230px}.deal-grid,.dealer-grid,.editorial-grid,.product-grid{grid-template-columns:1fr}.metal-grid{grid-template-columns:1fr 1fr}.footer-grid{grid-template-columns:1fr 1fr}.footer-grid>div:first-child{grid-column:1/-1}.section-head{display:block}.section-head p,.section-head .text-link{display:block;margin-top:15px}}
@media(max-width:620px){.store-shell{width:min(100% - 28px,1180px)}.store-section{padding:68px 0}.hero h1{font-size:52px}.hero-art{min-height:350px}.coin-front{width:235px;right:0}.coin-back{width:190px}.market-card{width:230px}.metal-grid,.category-grid,.related-row{grid-template-columns:1fr}.spot-panel span{padding:22px 16px}.category-title{display:block}.hero-mark{margin-bottom:24px}.editorial-callout{display:block}.editorial-callout .button{margin-top:22px}.footer-grid{grid-template-columns:1fr}.footer-grid>div:first-child{grid-column:auto}.ig-product-grid{grid-template-columns:1fr}.ig-tools{top:0}.ig-sticky{display:block}.ig-page{padding-bottom:72px}}
`;

const js = `
const PRODUCT_ROOT='/data/products';
const DEALER_SOURCE='/data/dealers/dealers.json';

export function createDealerBadge(dealer){
  const badge=document.createElement('span');
  badge.className='dealer-pill';
  badge.textContent=dealer.badge||dealer.name;
  badge.setAttribute('aria-label',\`Dealer: \${dealer.name}\`);
  return badge;
}

export function createProductCard(product,dealer){
  const article=document.createElement('article');
  article.className='product-card';
  const image=document.createElement('div');
  image.className='product-image';
  if(product.image){
    const img=document.createElement('img');
    img.src=product.image;
    img.alt=product.imageAlt||product.title;
    img.loading='lazy';
    img.decoding='async';
    image.append(img);
  }
  const body=document.createElement('div');
  body.className='product-body';
  const title=document.createElement('h3');
  title.textContent=product.title;
  const meta=document.createElement('div');
  meta.className='product-meta';
  meta.append(createDealerBadge(dealer));
  const price=document.createElement('span');
  price.className='price-placeholder';
  price.textContent=product.priceDisplay||'Price pending verification';
  meta.append(price);
  const cta=document.createElement('a');
  cta.className='product-cta';
  cta.textContent=product.cta||'View at dealer';
  cta.href=product.url;
  cta.target='_blank';
  cta.rel='sponsored nofollow noopener noreferrer';
  body.append(title,meta,cta);
  article.append(image,body);
  return article;
}

function productSchema(product,dealer){
  return {
    '@context':'https://schema.org',
    '@type':'Product',
    name:product.title,
    image:product.image,
    brand:{'@type':'Brand',name:product.brand||dealer.name},
    offers:{
      '@type':'Offer',
      url:product.url,
      priceCurrency:product.currency,
      price:product.price,
      availability:product.availability||'https://schema.org/InStock',
      seller:{'@type':'Organization',name:dealer.name}
    }
  };
}

async function loadDealers(){
  const response=await fetch(DEALER_SOURCE);
  if(!response.ok)throw new Error('Dealer data unavailable');
  return response.json();
}

async function renderDealers(){
  const grid=document.querySelector('[data-dealer-grid]');
  if(!grid)return;
  try{
    const {dealers}=await loadDealers();
    dealers.forEach(dealer=>{
      const card=document.createElement('article');
      card.className='dealer-card';
      card.innerHTML=\`<span class="dealer-badge" aria-hidden="true">\${dealer.badge}</span><h3>\${dealer.name}</h3><p>\${dealer.description}</p><small>Approved dealer badge</small>\`;
      grid.append(card);
    });
  }catch(error){
    grid.innerHTML='<p>Dealer profiles are temporarily unavailable.</p>';
  }
}

function createIgProductCard(product,dealer){
  const article=document.createElement('article');
  article.className='ig-product-card';
  article.dataset.collection=product.collection||'all';
  article.dataset.search=\`\${product.title} \${product.description||''} \${dealer.name}\`.toLowerCase();
  const image=document.createElement('div');
  image.className='ig-square-image';
  if(product.image){
    const img=document.createElement('img');
    img.src=product.image;
    img.alt=product.imageAlt||product.title;
    img.loading='lazy';
    img.decoding='async';
    image.append(img);
  }else{
    image.innerHTML='<span aria-hidden="true">eS</span>';
  }
  const body=document.createElement('div');
  body.className='ig-product-body';
  const badge=createDealerBadge(dealer);
  const title=document.createElement('h3');
  title.textContent=product.title;
  const description=document.createElement('p');
  description.textContent=product.description||'Verified product details will appear with the dealer feed.';
  const cta=document.createElement(product.affiliateUrl?'a':'span');
  cta.className='ig-shop-button';
  cta.textContent=product.affiliateUrl?'Shop Now':'Coming Soon';
  if(product.affiliateUrl){
    cta.href=product.affiliateUrl;
    cta.target='_blank';
    cta.rel='sponsored nofollow noopener noreferrer';
  }else{
    cta.setAttribute('aria-disabled','true');
  }
  body.append(badge,title,description,cta);
  article.append(image,body);
  return article;
}

async function renderIgStore(){
  const grid=document.querySelector('[data-ig-product-grid]');
  const dealerList=document.querySelector('[data-ig-dealer-list]');
  if(!grid&&!dealerList)return;
  try{
    const [productsResponse,dealerData]=await Promise.all([
      fetch('/data/products/instagram.json'),
      loadDealers()
    ]);
    if(!productsResponse.ok)throw new Error('Instagram product data unavailable');
    const {products=[]}=await productsResponse.json();
    const dealerMap=new Map(dealerData.dealers.map(dealer=>[dealer.id,dealer]));
    if(dealerList){
      dealerData.dealers.forEach(dealer=>{
        const card=document.createElement('button');
        card.type='button';
        card.dataset.dealer=dealer.id;
        card.innerHTML=\`<span class="dealer-badge">\${dealer.badge}</span><span><strong>\${dealer.name}</strong><small>Browse dealer products</small></span><span>→</span>\`;
        dealerList.append(card);
      });
    }
    if(grid&&products.length){
      grid.innerHTML='';
      products.forEach(product=>{
        const dealer=dealerMap.get(product.dealerId);
        if(dealer)grid.append(createIgProductCard(product,dealer));
      });
    }
    const carousel=document.querySelector('[data-featured-carousel]');
    const featured=products.filter(product=>product.featured&&product.affiliateUrl);
    if(carousel&&featured.length){
      carousel.innerHTML='';
      featured.forEach(product=>{
        const dealer=dealerMap.get(product.dealerId);
        if(dealer)carousel.append(createIgProductCard(product,dealer));
      });
    }
  }catch(error){
    grid?.setAttribute('data-error','true');
  }
}

async function renderProducts(){
  const grid=document.querySelector('[data-product-grid]');
  if(!grid)return;
  const category=grid.dataset.category;
  try{
    const [productResponse,dealerData]=await Promise.all([
      fetch(\`\${PRODUCT_ROOT}/\${category}.json\`),
      loadDealers()
    ]);
    if(!productResponse.ok)throw new Error('Product data unavailable');
    const {products=[]}=await productResponse.json();
    const dealerMap=new Map(dealerData.dealers.map(dealer=>[dealer.id,dealer]));
    const schemas=[];
    products.forEach(product=>{
      const dealer=dealerMap.get(product.dealerId);
      if(!dealer||!product.url)return;
      grid.append(createProductCard(product,dealer));
      if(product.price&&product.currency&&product.image)schemas.push(productSchema(product,dealer));
    });
    if(products.length){
      document.querySelector('[data-empty-state]')?.remove();
    }
    schemas.forEach(schema=>{
      const node=document.createElement('script');
      node.type='application/ld+json';
      node.textContent=JSON.stringify(schema);
      document.head.append(node);
    });
  }catch(error){
    grid.setAttribute('data-error','true');
  }
}

const menu=document.querySelector('.store-menu');
const navigation=document.querySelector('.store-links');
menu?.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')==='true';
  menu.setAttribute('aria-expanded',String(!open));
  navigation?.classList.toggle('open',!open);
});

renderDealers();
renderProducts();
renderIgStore();

const searchForm=document.querySelector('[data-product-search]');
const searchInput=document.querySelector('#ig-product-search');
const applyIgFilters=()=>{
  const active=document.querySelector('[data-filter-row] .active')?.dataset.filter||'all';
  const query=(searchInput?.value||'').trim().toLowerCase();
  document.querySelectorAll('.ig-product-card').forEach(card=>{
    const categoryMatch=active==='all'||card.dataset.collection===active;
    const searchMatch=!query||card.dataset.search.includes(query);
    card.hidden=!(categoryMatch&&searchMatch);
  });
};
searchForm?.addEventListener('submit',event=>{event.preventDefault();applyIgFilters()});
searchInput?.addEventListener('input',applyIgFilters);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  applyIgFilters();
}));
document.querySelector('[data-carousel-prev]')?.addEventListener('click',()=>document.querySelector('[data-featured-carousel]')?.scrollBy({left:-300,behavior:'smooth'}));
document.querySelector('[data-carousel-next]')?.addEventListener('click',()=>document.querySelector('[data-featured-carousel]')?.scrollBy({left:300,behavior:'smooth'}));
`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><radialGradient id="b"><stop stop-color="#2b2418"/><stop offset="1" stop-color="#050505"/></radialGradient><radialGradient id="g"><stop stop-color="#fff1bd"/><stop offset=".45" stop-color="#c18e32"/><stop offset="1" stop-color="#6f4b14"/></radialGradient></defs><rect width="1200" height="630" fill="url(#b)"/><circle cx="910" cy="300" r="200" fill="url(#g)" stroke="#ead19a" stroke-width="7"/><circle cx="910" cy="300" r="165" fill="none" stroke="#6f4b14" stroke-width="2" stroke-dasharray="7 9"/><text x="910" y="330" text-anchor="middle" font-family="Arial" font-size="110" font-weight="700" fill="#241805">eS</text><text x="90" y="270" font-family="Arial" font-size="80" font-weight="700" fill="#fff">eStack</text><text x="90" y="345" font-family="Arial" font-size="52" font-weight="700" fill="#ead19a">BULLION</text><text x="90" y="410" font-family="Arial" font-size="28" fill="#aaa">Precious metals. Refined.</text></svg>`;

function write(relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
}

write('index.html', homepage);
write('shop/index.html', shop);
write('ig/index.html', ig);
for (const category of categories) {
  write(`shop/${category[0]}/index.html`, categoryPage(category));
  write(`data/products/${category[0]}.json`, `${JSON.stringify({schemaVersion: 1, category: category[0], products: []}, null, 2)}\n`);
}
write('data/products/index.json', `${JSON.stringify({schemaVersion: 1, categories: categories.map(([slug, name]) => ({slug, name}))}, null, 2)}\n`);
write('data/products/instagram.json', `${JSON.stringify({schemaVersion: 1, channel: 'social', products: []}, null, 2)}\n`);
write('data/dealers/dealers.json', `${JSON.stringify({schemaVersion: 1, dealers}, null, 2)}\n`);
write('assets/bullion-store.css', css.trimStart());
write('assets/bullion-store.js', js.trimStart());
write('assets/estack-bullion-og.svg', og);
