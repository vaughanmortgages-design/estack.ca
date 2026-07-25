import test from 'node:test';
import assert from 'node:assert/strict';
import {googleSheetCsvUrl, normalizeProducts, parseCsv, toMetaCsv, toMetaXml, isMetaReady} from '../scripts/lib/catalog-core.mjs';

const dealers = [{id: 'kitco', name: 'Kitco'}];
const valid = {
  id: 'gold-1',
  title: 'Verified Gold Bar',
  description: 'A verified test description.',
  price: 100,
  currency: 'CAD',
  image: 'https://example.com/gold.webp',
  availability: 'in stock',
  dealerId: 'kitco',
  affiliateUrl: 'https://example.com/approved',
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

test('rejects duplicate product ids', () => {
  const row = {id: 'duplicate', title: 'Gold Bar'};
  assert.throws(() => normalizeProducts([row, row]), /Duplicate product id/);
});

test('excludes placeholder affiliate links from Meta catalog', () => {
  assert.equal(isMetaReady({...valid, affiliateUrl: 'APPROVED_AFFILIATE_URL'}, new Set(['kitco'])), false);
  assert.equal(toMetaCsv([{...valid, affiliateUrl: ''}], dealers).split('\n').length, 2);
});

test('exports valid CSV and escaped XML for complete products', () => {
  const csv = toMetaCsv([valid], dealers);
  assert.match(csv, /"gold-1"/);
  assert.match(csv, /"100.00 CAD"/);
  const xml = toMetaXml([{...valid, title: 'Gold & Silver'}], dealers);
  assert.match(xml, /Gold &amp; Silver/);
  assert.match(xml, /xmlns:g="http:\/\/base.google.com\/ns\/1.0"/);
});
