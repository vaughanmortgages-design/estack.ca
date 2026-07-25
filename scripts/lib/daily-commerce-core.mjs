import {createHash} from 'node:crypto';

const DAY = 86_400_000;

function text(value, maximum) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  return normalized.length <= maximum ? normalized : `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

function categoryLabel(value) {
  return String(value ?? 'bullion').split('-').filter(Boolean).map(word => `${word[0]?.toUpperCase() || ''}${word.slice(1)}`).join(' ');
}

export function productFingerprint(product) {
  const fields = ['title', 'description', 'price', 'previousPrice', 'currency', 'image', 'availability', 'dealerId', 'affiliateUrl', 'category', 'collection', 'featured', 'bestSeller', 'merchantPriority', 'createdAt'];
  const stable = Object.fromEntries(fields.map(field => [field, product[field] ?? null]));
  return createHash('sha256').update(JSON.stringify(stable)).digest('hex');
}

export function detectProductChanges(products, previousState = {}) {
  const current = {};
  const added = [];
  const changed = [];
  const unchanged = [];
  for (const product of products) {
    const fingerprint = productFingerprint(product);
    current[product.id] = {fingerprint, price: product.price};
    if (!previousState[product.id]) added.push(product.id);
    else if (previousState[product.id].fingerprint !== fingerprint) changed.push(product.id);
    else unchanged.push(product.id);
  }
  const removed = Object.keys(previousState).filter(id => !current[id]);
  return {current, added, changed, unchanged, removed};
}

export function scoreProduct(product, now = new Date()) {
  const created = product.createdAt ? new Date(product.createdAt) : null;
  const age = created && !Number.isNaN(created.valueOf()) ? Math.max(0, now - created) : Number.POSITIVE_INFINITY;
  const newArrival = age <= 14 * DAY ? 25 : 0;
  const featured = product.featured ? 25 : 0;
  const bestSeller = product.bestSeller ? 20 : 0;
  const reduction = product.previousPrice && product.price !== null && product.previousPrice > product.price
    ? Math.min(20, Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100))
    : 0;
  const availability = product.availability === 'in stock' ? 10 : product.availability === 'preorder' ? 5 : 0;
  const merchantPriority = Math.max(0, Math.min(10, Number(product.merchantPriority) || 0));
  const breakdown = {newArrival, featured, bestSeller, priceReduction: reduction, availability, merchantPriority};
  return {score: Object.values(breakdown).reduce((sum, value) => sum + value, 0), scoreBreakdown: breakdown};
}

export function selectDailyFeatured(products, limit = 10, now = new Date()) {
  return products.map(product => ({...product, ...scoreProduct(product, now)}))
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, limit)
    .map((product, index) => ({...product, featuredRank: index + 1, dailyFeatured: true}));
}

export function groundedContent(product, dealerName = '') {
  const shortTitle = text(product.title, 70);
  const description = text(product.description || product.title, 220);
  const dealer = text(dealerName || product.dealerId, 60);
  const category = categoryLabel(product.category);
  const supplied = `${product.title} ${product.description || ''} ${dealer} ${category}`.trim();
  return {
    shortTitle,
    shortDescription: description,
    instagramCaption: text(`${shortTitle}\n\n${description}\n\nExplore this ${category.toLowerCase()} listing from ${dealer}.`, 500),
    pinterestDescription: text(`${shortTitle}. ${description} Explore this ${category.toLowerCase()} listing from ${dealer} through eStack.ca.`, 500),
    altText: text(`${product.title} — ${dealer}`, 125),
    sourceText: supplied
  };
}

function numericTokens(value) {
  return new Set(String(value ?? '').match(/\d+(?:[.,]\d+)?/g) || []);
}

export function contentIsGrounded(content, product, dealerName = '') {
  const sourceNumbers = numericTokens(`${product.title} ${product.description} ${product.price ?? ''} ${product.previousPrice ?? ''} ${dealerName}`);
  const outputNumbers = numericTokens(Object.values(content).join(' '));
  return [...outputNumbers].every(token => sourceNumbers.has(token));
}

export async function generateProductContent(product, dealerName = '', endpoint = process.env.AI_CONTENT_WEBHOOK_URL) {
  const fallback = groundedContent(product, dealerName);
  if (!endpoint) return {...fallback, generator: 'feed-grounded-template'};
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      instruction: 'Write only from the supplied fields. Do not add prices, dimensions, weights, purity, availability claims or specifications.',
      product: {
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        availability: product.availability,
        dealer: dealerName,
        category: product.category
      },
      requiredFields: ['shortTitle', 'shortDescription', 'instagramCaption', 'pinterestDescription', 'altText']
    })
  });
  if (!response.ok) return {...fallback, generator: 'feed-grounded-template'};
  const candidate = await response.json();
  const required = ['shortTitle', 'shortDescription', 'instagramCaption', 'pinterestDescription', 'altText'];
  if (!required.every(field => typeof candidate[field] === 'string') || !contentIsGrounded(candidate, product, dealerName)) {
    return {...fallback, generator: 'feed-grounded-template'};
  }
  return {
    shortTitle: text(candidate.shortTitle, 70),
    shortDescription: text(candidate.shortDescription, 220),
    instagramCaption: text(candidate.instagramCaption, 500),
    pinterestDescription: text(candidate.pinterestDescription, 500),
    altText: text(candidate.altText, 125),
    generator: 'ai-webhook-grounded'
  };
}

export function productSeo(product, dealerName = '') {
  const canonicalUrl = product.productPageUrl?.startsWith('https://estack.ca/')
    ? product.productPageUrl
    : `https://estack.ca/ig/?product=${encodeURIComponent(product.id)}`;
  const title = `${product.content?.shortTitle || product.title} | eStack Bullion`;
  const description = product.content?.shortDescription || text(product.description, 220);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image || undefined,
    category: categoryLabel(product.category),
    brand: product.brand ? {'@type': 'Brand', name: product.brand} : undefined,
    offers: product.affiliateUrl && product.price !== null ? {
      '@type': 'Offer',
      url: product.affiliateUrl,
      price: product.price,
      priceCurrency: product.currency,
      availability: product.availability === 'in stock' ? 'https://schema.org/InStock' : product.availability === 'preorder' ? 'https://schema.org/PreOrder' : 'https://schema.org/OutOfStock',
      seller: {'@type': 'Organization', name: dealerName}
    } : undefined
  };
  return {
    canonicalUrl,
    openGraph: {title, description, image: product.image || ''},
    twitterCard: {card: 'summary_large_image', title, description, image: product.image || ''},
    jsonLd
  };
}

