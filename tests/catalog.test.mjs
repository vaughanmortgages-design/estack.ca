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

const validSourceRow = (overrides = {}) => ({
  id: 'source-product',
  dealer_id: 'kitco',
  category: 'gold-bars',
  title: 'Source Product',
  description: 'Verified source description.',
  product_url: 'https://merchant.example/products/source-product',
  affiliate_url: 'https://www.awin1.com/cread.php?s=3795009&v=84579&q=505826&r=2936205',
  image: 'https://images.example.com/source-product.webp',
  currency: 'CAD',
  availability: 'in stock',
  featured: 'FALSE',
  new_arrival: 'FALSE',
  clearance: 'FALSE',
  best_value: 'FALSE',
  best_seller: 'FALSE',
  merchant_priority: '5',
  collection: 'gold',
  last_updated: '2026-07-26T00:00:00Z',
  condition: 'new',
  active: 'TRUE',
  ...overrides
});

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
    affiliateUrl: 'https://www.sprottmoney.ca/?acc=paul-maladrino-5887a',
    category: 'gold-bars',
    collection: 'gold',
    productPageUrl: 'https://estack.ca/ig/?product=json-product',
    createdAt: '2026-07-25',
    bestSeller: true,
    previousPrice: 125,
    merchantPriority: 8
  }]);
  assert.equal(product.dealerId, 'sprott-money');
  assert.equal(product.affiliateUrl, 'https://www.sprottmoney.ca/?acc=paul-maladrino-5887a');
  assert.equal(product.productPageUrl, 'https://estack.ca/ig/?product=json-product');
  assert.equal(product.bestSeller, true);
  assert.equal(product.previousPrice, 125);
  assert.equal(product.merchantPriority, 8);
  assert.equal(product.active, true);
});

test('keeps inactive master-catalog products out of Meta exports', () => {
  const [product] = normalizeProducts([{
    id: 'inactive-product',
    title: 'Inactive Product',
    description: 'Not for publication.',
    dealer_id: 'sprott-money',
    affiliate_url: 'https://www.sprottmoney.ca/?acc=paul-maladrino-5887a',
    image: 'https://images.example.com/inactive.webp',
    category: 'gold-bars',
    price: 100,
    currency: 'CAD',
    availability: 'in stock',
    active: false
  }]);
  const dealers = [{
    id: 'sprott-money',
    name: 'Sprott Money',
    affiliateValidation: {
      hosts: ['www.sprottmoney.ca'],
      requiredQuery: {acc: 'paul-maladrino-5887a'}
    }
  }];
  assert.equal(product.active, false);
  assert.equal(toMetaCsv([product], dealers).trim(), 'id,title,description,availability,condition,price,link,image_link,brand,product_type');
});

test('rejects duplicate product ids', () => {
  const row = {id: 'duplicate', title: 'Gold Bar'};
  assert.throws(() => normalizeProducts([row, row]), /Duplicate product id/);
});

test('incremental importer skips and reports duplicate product ids', () => {
  const row = validSourceRow({id: 'duplicate'});
  const result = normalizeProductsDetailed([row, row]);
  assert.equal(result.products.length, 1);
  assert.deepEqual(result.duplicatesSkipped, ['duplicate']);
  assert.equal(result.report.importedRows, 1);
  assert.equal(result.report.skippedRows, 1);
  assert.deepEqual(result.report.duplicateRows, [{rowNumber: 3, id: 'duplicate'}]);
});

test('reports blank, inactive and invalid source rows', () => {
  const result = normalizeProductsDetailed([
    {},
    validSourceRow({id: 'inactive', active: 'FALSE', description: ''}),
    validSourceRow({id: 'invalid', image: ''}),
    validSourceRow({id: 'active'})
  ]);
  assert.deepEqual(result.products.map(product => product.id), ['active']);
  assert.equal(result.report.blankRows.length, 1);
  assert.deepEqual(result.report.inactiveRows, [{rowNumber: 3, id: 'inactive'}]);
  assert.equal(result.report.invalidRows.length, 1);
  assert.deepEqual(result.report.invalidRows[0].missingRequiredFields, ['image']);
  assert.equal(result.report.missingRequiredFields.image, 1);
  assert.equal(result.report.importedRows, 1);
  assert.equal(result.report.skippedRows, 3);
});

test('preserves merchant names and source URLs exactly', () => {
  const affiliateUrl = 'https://www.awin1.com/cread.php?s=3795009&v=84579&q=505826&r=2936205&clickref=CaseSensitive';
  const image = 'https://images.example.com/CaseSensitive%20Image.webp?token=A%2FB';
  const productUrl = 'https://merchant.example/CaseSensitive-Product?variant=A%2FB';
  const result = normalizeProductsDetailed([validSourceRow({
    merchant_name: 'Kitco (US & Canada)',
    affiliate_url: affiliateUrl,
    image,
    product_url: productUrl
  })]);
  assert.equal(result.products[0].merchantName, 'Kitco (US & Canada)');
  assert.equal(result.products[0].affiliateUrl, affiliateUrl);
  assert.equal(result.products[0].image, image);
  assert.equal(result.products[0].productUrl, productUrl);
});

test('rejects unsupported merchant, category and invalid required values', () => {
  const result = normalizeProductsDetailed([validSourceRow({
    dealer_id: 'unknown-merchant',
    category: 'not-a-category',
    availability: 'maybe',
    active: '',
    last_updated: 'not-a-date'
  })], {dealerIds: new Set(['kitco'])});
  assert.equal(result.products.length, 0);
  assert.equal(result.report.invalidRows.length, 1);
  assert.match(result.report.invalidRows[0].errors.join(' '), /Missing required fields: active/);
  assert.match(result.report.invalidRows[0].errors.join(' '), /Unknown dealer_id/);
  assert.match(result.report.invalidRows[0].errors.join(' '), /Unsupported category/);
  assert.match(result.report.invalidRows[0].errors.join(' '), /Unsupported availability/);
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
