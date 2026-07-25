import test from 'node:test';
import assert from 'node:assert/strict';
import {
  googleSheetCsvUrl,
  isApprovedAffiliateUrl,
  isMetaReady,
  normalizeProducts,
  normalizeProductsDetailed,
  parseCsv,
  STOREFRONT_CATEGORIES,
  toMetaCsv,
  toMetaXml
} from '../scripts/lib/catalog-core.mjs';

const dealers = [{
  id: 'kitco',
  name: 'Kitco',
  affiliateValidation: {
    hosts: ['www.awin1.com'],
    requiredQuery: {v: '84579', r: '2936205'}
  }
}];
const valid = {
  id: 'gold-1',
  title: 'Verified Gold Bar',
  description: 'A verified test description.',
  price: 100,
  currency: 'CAD',
  image: 'https://example.com/gold.webp',
  availability: 'in stock',
  dealerId: 'kitco',
  affiliateUrl: 'https://www.awin1.com/cread.php?s=3795009&v=84579&q=505826&r=2936205',
  category: 'gold-bars',
  collection: 'gold',
  condition: 'new',
  brand: 'Test Mint'
};

test('converts an editable Google Sheet URL to CSV export', () => {
  assert.equal(
    googleSheetCsvUrl('https://docs.google.com/spreadsheets/d/abc123/edit?gid=42#gid=42'),
    'https://docs.google.com/spreadsheets/d/abc123/export?format=csv&gid=42'
  );
});

test('parses quoted CSV fields', () => {
  const rows = parseCsv('id,title,description\n1,"Gold, Bar","A ""quoted"" value"\n');
  assert.deepEqual(rows, [{id: '1', title: 'Gold, Bar', description: 'A "quoted" value'}]);
});

test('normalizes reusable product fields', () => {
  const [product] = normalizeProducts([{
    product_id: 'sku-1',
    name: 'Silver Coin',
    short_description: 'Verified description',
    amount: '$29.95',
    price_currency: 'cad',
    image_link: 'https://example.com/silver.webp',
    stock_status: 'available',
    dealer: 'Kitco',
    affiliate_link: 'APPROVED_AFFILIATE_URL',
    product_category: 'Silver Coins',
    metal: 'Silver'
  }]);
  assert.equal(product.price, 29.95);
  assert.equal(product.currency, 'CAD');
  assert.equal(product.dealerId, 'kitco');
  assert.equal(product.category, 'silver-coins');
  assert.equal(product.availability, 'in stock');
});

test('imports the documented camelCase JSON product shape', () => {
  const [product] = normalizeProducts([{
    id: 'json-product',
    title: 'JSON Product',
    dealerId: 'sprott-money',
    affiliateUrl: 'https://www.sprottmoney.ca/?acc=paul-malandrino-5887a',
    category: 'gold-bars',
    collection: 'gold',
    productPageUrl: 'https://estack.ca/ig/?product=json-product',
    createdAt: '2026-07-25',
    bestSeller: true,
    previousPrice: 125,
    merchantPriority: 8
  }]);
  assert.equal(product.dealerId, 'sprott-money');
  assert.equal(product.affiliateUrl, 'https://www.sprottmoney.ca/?acc=paul-malandrino-5887a');
  assert.equal(product.productPageUrl, 'https://estack.ca/ig/?product=json-product');
  assert.equal(product.bestSeller, true);
  assert.equal(product.previousPrice, 125);
  assert.equal(product.merchantPriority, 8);
});

test('rejects duplicate product ids', () => {
  const row = {id: 'duplicate', title: 'Gold Bar'};
  assert.throws(() => normalizeProducts([row, row]), /Duplicate product id/);
});

test('incremental importer skips and reports duplicate product ids', () => {
  const row = {id: 'duplicate', title: 'Gold Bar'};
  const result = normalizeProductsDetailed([row, row]);
  assert.equal(result.products.length, 1);
  assert.deepEqual(result.duplicatesSkipped, ['duplicate']);
});

test('excludes placeholder affiliate links from Meta catalog', () => {
  assert.equal(isMetaReady({...valid, affiliateUrl: 'APPROVED_AFFILIATE_URL'}, dealers), false);
  assert.equal(toMetaCsv([{...valid, affiliateUrl: ''}], dealers).split('\n').length, 2);
});

test('accepts only tracked dealer URLs with required parameters', () => {
  assert.equal(isApprovedAffiliateUrl(valid.affiliateUrl, dealers[0]), true);
  assert.equal(isApprovedAffiliateUrl('https://www.awin1.com/cread.php?v=84579', dealers[0]), false);
  assert.equal(isApprovedAffiliateUrl('https://example.com/?v=84579&r=2936205', dealers[0]), false);
  assert.equal(isMetaReady(valid, dealers), true);
});

test('defines every generated storefront category centrally', () => {
  assert.deepEqual(STOREFRONT_CATEGORIES, [
    'gold-bars', 'gold-coins', 'silver-bars', 'silver-coins', 'platinum',
    'palladium', 'copper', 'vault-products', 'collectibles', 'deals'
  ]);
});

test('exports valid CSV and escaped XML for complete products', () => {
  const csv = toMetaCsv([valid], dealers);
  assert.match(csv, /"gold-1"/);
  assert.match(csv, /"100.00 CAD"/);
  const xml = toMetaXml([{...valid, title: 'Gold & Silver'}], dealers);
  assert.match(xml, /Gold &amp; Silver/);
  assert.match(xml, /xmlns:g="http:\/\/base.google.com\/ns\/1.0"/);
});
