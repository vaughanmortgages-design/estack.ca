import fs from 'node:fs/promises';

export const STOREFRONT_CATEGORIES = [
  'gold-bars',
  'gold-coins',
  'silver-bars',
  'silver-coins',
  'platinum',
  'palladium',
  'copper',
  'vault-products',
  'collectibles',
  'deals'
];

const fieldAliases = {
  id: ['id', 'product_id', 'sku', 'retailer_id'],
  title: ['title', 'product_title', 'name'],
  description: ['description', 'short_description', 'body'],
  price: ['price', 'amount'],
  currency: ['currency', 'price_currency'],
  image: ['image', 'image_url', 'image_link'],
  availability: ['availability', 'stock_status', 'status'],
  dealerId: ['dealerId', 'dealer_id', 'dealer', 'dealer_slug'],
  affiliateUrl: ['affiliateUrl', 'affiliate_url', 'affiliate_link', 'url', 'link'],
  category: ['category', 'product_category'],
  collection: ['collection', 'metal'],
  featured: ['featured', 'is_featured'],
  brand: ['brand', 'mint', 'refiner'],
  condition: ['condition'],
  productPageUrl: ['productPageUrl', 'product_page_url', 'website_url'],
  createdAt: ['createdAt', 'created_at', 'arrival_date', 'date_added', 'published_at'],
  bestSeller: ['bestSeller', 'best_seller', 'bestseller', 'is_best_seller'],
  previousPrice: ['previousPrice', 'previous_price', 'original_price', 'compare_at_price'],
  merchantPriority: ['merchantPriority', 'merchant_priority', 'dealer_priority', 'priority'],
  active: ['active', 'is_active', 'enabled']
};

const availabilityMap = new Map([
  ['in stock', 'in stock'],
  ['instock', 'in stock'],
  ['available', 'in stock'],
  ['preorder', 'preorder'],
  ['pre-order', 'preorder'],
  ['out of stock', 'out of stock'],
  ['outofstock', 'out of stock'],
  ['sold out', 'out of stock'],
  ['coming soon', 'out of stock']
]);

function cleanHeader(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function cleanValue(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function valueFor(row, field) {
  for (const alias of fieldAliases[field]) {
    if (row[alias] !== undefined && row[alias] !== '') return cleanValue(row[alias]);
  }
  return '';
}

function slug(value) {
  return String(value ?? '').trim().toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function booleanValue(value) {
  return ['1', 'true', 'yes', 'y', 'featured'].includes(String(value ?? '').trim().toLowerCase());
}

function priceValue(value) {
  const normalized = String(value ?? '').replace(/[^0-9.-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? Number(parsed.toFixed(2)) : null;
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some(cell => cell !== '')) rows.push(row);
  if (!rows.length) return [];
  const headers = rows.shift().map(cleanHeader);
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

export function googleSheetCsvUrl(input) {
  const url = new URL(input);
  if (!url.hostname.endsWith('docs.google.com')) return url.toString();
  const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
  if (!match) throw new Error('Google Sheets URL must contain a spreadsheet ID');
  const gid = url.searchParams.get('gid') || url.hash.match(/gid=(\d+)/)?.[1] || '0';
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
}

export function normalizeProduct(row, index = 0) {
  const dealerRaw = valueFor(row, 'dealerId');
  const categoryRaw = valueFor(row, 'category');
  const collectionRaw = valueFor(row, 'collection') || categoryRaw;
  const title = valueFor(row, 'title');
  const id = valueFor(row, 'id') || slug(`${dealerRaw}-${title}-${index + 1}`);
  const availabilityRaw = String(valueFor(row, 'availability') || 'out of stock').toLowerCase();
  return {
    id,
    title,
    description: valueFor(row, 'description'),
    price: priceValue(valueFor(row, 'price')),
    currency: String(valueFor(row, 'currency') || 'CAD').toUpperCase(),
    image: valueFor(row, 'image'),
    availability: availabilityMap.get(availabilityRaw.replace(/_/g, ' ')) || 'out of stock',
    dealerId: slug(dealerRaw),
    affiliateUrl: valueFor(row, 'affiliateUrl'),
    category: slug(categoryRaw),
    collection: slug(collectionRaw),
    featured: booleanValue(valueFor(row, 'featured')),
    brand: valueFor(row, 'brand'),
    condition: String(valueFor(row, 'condition') || 'new').toLowerCase(),
    productPageUrl: valueFor(row, 'productPageUrl'),
    createdAt: valueFor(row, 'createdAt'),
    bestSeller: booleanValue(valueFor(row, 'bestSeller')),
    previousPrice: priceValue(valueFor(row, 'previousPrice')),
    merchantPriority: Math.max(0, Math.min(10, Number(valueFor(row, 'merchantPriority')) || 0)),
    active: valueFor(row, 'active') === '' ? true : booleanValue(valueFor(row, 'active'))
  };
}

export function normalizeProducts(rows) {
  const products = rows.map(normalizeProduct).filter(product => product.id && product.title);
  const ids = new Set();
  for (const product of products) {
    if (ids.has(product.id)) throw new Error(`Duplicate product id: ${product.id}`);
    ids.add(product.id);
  }
  return products;
}

export function normalizeProductsDetailed(rows) {
  const products = [];
  const seen = new Set();
  const duplicatesSkipped = [];
  rows.map(normalizeProduct).filter(product => product.id && product.title).forEach(product => {
    if (seen.has(product.id)) {
      duplicatesSkipped.push(product.id);
      return;
    }
    seen.add(product.id);
    products.push(product);
  });
  return {products, duplicatesSkipped};
}

async function readProductSource(source) {
  if (!source) throw new Error('A Google Sheets, JSON or CSV source is required');
  const remote = /^https?:\/\//i.test(source);
  let content;
  let type;
  if (remote) {
    const target = source.includes('docs.google.com/spreadsheets') ? googleSheetCsvUrl(source) : source;
    const response = await fetch(target, {headers: {'user-agent': 'eStack-Catalog-Builder/1.0'}});
    if (!response.ok) throw new Error(`Product source returned HTTP ${response.status}`);
    content = await response.text();
    type = response.headers.get('content-type')?.includes('json') || target.toLowerCase().includes('.json') ? 'json' : 'csv';
  } else {
    content = await fs.readFile(source, 'utf8');
    type = source.toLowerCase().endsWith('.json') ? 'json' : 'csv';
  }
  if (type === 'json') {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.products || [];
  }
  return parseCsv(content);
}

export async function importProducts(source) {
  return normalizeProducts(await readProductSource(source));
}

export async function importProductsDetailed(source) {
  return normalizeProductsDetailed(await readProductSource(source));
}

export function isPlaceholderUrl(value) {
  if (!value) return true;
  const normalized = String(value).trim().toLowerCase();
  return normalized.includes('placeholder') || normalized.includes('approved_affiliate_url') || normalized === '#';
}

export function isApprovedAffiliateUrl(value, dealer = {}) {
  if (isPlaceholderUrl(value)) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const validation = dealer.affiliateValidation;
    if (!validation) return false;
    const hosts = validation.hosts || [];
    if (hosts.length && !hosts.includes(url.hostname.toLowerCase())) return false;
    return Object.entries(validation.requiredQuery || {}).every(
      ([name, expected]) => url.searchParams.get(name) === String(expected)
    );
  } catch {
    return false;
  }
}

export function isMetaReady(product, dealers = []) {
  if (product.active === false) return false;
  const dealerMap = dealers instanceof Map ? dealers : new Map(dealers.map(dealer => [dealer.id, dealer]));
  const dealer = dealerMap.get(product.dealerId);
  if (!product.id || !product.title || !product.description || !product.image || !product.category) return false;
  if (!dealer || !isApprovedAffiliateUrl(product.affiliateUrl, dealer)) return false;
  try {
    const link = new URL(product.affiliateUrl);
    const image = new URL(product.image);
    if (link.protocol !== 'https:' || image.protocol !== 'https:') return false;
  } catch {
    return false;
  }
  return product.price !== null && product.price >= 0 && /^[A-Z]{3}$/.test(product.currency);
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function metaCatalogRows(products, dealers) {
  const dealerMap = new Map(dealers.map(dealer => [dealer.id, dealer]));
  return products.filter(product => isMetaReady(product, dealerMap)).map(product => ({
    id: product.id,
    title: product.title,
    description: product.description,
    availability: product.availability,
    condition: product.condition || 'new',
    price: `${product.price.toFixed(2)} ${product.currency}`,
    link: product.affiliateUrl,
    image_link: product.image,
    brand: product.brand || dealerMap.get(product.dealerId).name,
    product_type: product.category
  }));
}

export function toMetaCsv(products, dealers) {
  const headers = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand', 'product_type'];
  const rows = metaCatalogRows(products, dealers);
  return `${headers.join(',')}\n${rows.map(row => headers.map(header => csvCell(row[header])).join(',')).join('\n')}${rows.length ? '\n' : ''}`;
}

function xml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function toMetaXml(products, dealers) {
  const rows = metaCatalogRows(products, dealers);
  const items = rows.map(row => `<item><g:id>${xml(row.id)}</g:id><g:title>${xml(row.title)}</g:title><g:description>${xml(row.description)}</g:description><g:availability>${xml(row.availability)}</g:availability><g:condition>${xml(row.condition)}</g:condition><g:price>${xml(row.price)}</g:price><g:link>${xml(row.link)}</g:link><g:image_link>${xml(row.image_link)}</g:image_link><g:brand>${xml(row.brand)}</g:brand><g:product_type>${xml(row.product_type)}</g:product_type></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel><title>eStack Bullion Catalog</title><link>https://estack.ca/ig/</link><description>Verified eStack.ca bullion products</description>${items}</channel></rss>\n`;
}
