import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contentIsGrounded,
  detectProductChanges,
  groundedContent,
  isShowroomEligible,
  productFingerprint,
  productSeo,
  scoreProduct,
  selectDailyFeatured
} from '../scripts/lib/daily-commerce-core.mjs';

const base = {
  id: 'product-1',
  title: 'Gold Bar',
  description: 'A listed gold bar.',
  price: 100,
  previousPrice: 120,
  currency: 'CAD',
  availability: 'in stock',
  dealerId: 'kitco',
  affiliateUrl: '',
  category: 'gold-bars',
  collection: 'gold',
  featured: true,
  bestSeller: true,
  merchantPriority: 5,
  createdAt: '2026-07-24'
};

test('detects new, changed and unchanged products without duplicates', () => {
  const previous = {
    'product-1': {fingerprint: productFingerprint(base)},
    removed: {fingerprint: 'old'}
  };
  const changed = {...base, price: 95};
  const result = detectProductChanges([changed], previous);
  assert.deepEqual(result.added, []);
  assert.deepEqual(result.changed, ['product-1']);
  assert.deepEqual(result.removed, ['removed']);
});

test('detects metadata and affiliate-verification changes', () => {
  const previous = {'product-1': {fingerprint: productFingerprint(base)}};
  assert.deepEqual(detectProductChanges([{...base, brand: 'Verified Mint'}], previous).changed, ['product-1']);
  assert.deepEqual(detectProductChanges([{...base, affiliateVerified: true}], previous).changed, ['product-1']);
});

test('scores every requested commerce signal', () => {
  const result = scoreProduct(base, new Date('2026-07-25T12:00:00Z'));
  assert.equal(result.scoreBreakdown.newArrival, 25);
  assert.equal(result.scoreBreakdown.featured, 25);
  assert.equal(result.scoreBreakdown.bestSeller, 20);
  assert.equal(result.scoreBreakdown.priceReduction, 17);
  assert.equal(result.scoreBreakdown.availability, 10);
  assert.equal(result.scoreBreakdown.merchantPriority, 5);
  assert.equal(result.score, 102);
});

test('uses configurable ranking weights', () => {
  const rules = {
    featured: 3,
    newest: 4,
    newestWindowDays: 7,
    bestSeller: 5,
    priceChangeMax: 6,
    availability: {inStock: 7, preorder: 2},
    merchantPriorityMax: 4
  };
  const result = scoreProduct(base, new Date('2026-07-25T12:00:00Z'), rules);
  assert.deepEqual(result.scoreBreakdown, {
    newArrival: 4,
    featured: 3,
    bestSeller: 5,
    priceReduction: 6,
    availability: 7,
    merchantPriority: 4
  });
});

test('selects a deterministic top ten', () => {
  const products = Array.from({length: 12}, (_, index) => ({...base, id: `p-${index}`, merchantPriority: index % 10}));
  const featured = selectDailyFeatured(products, 10, new Date('2026-07-25T12:00:00Z'));
  assert.equal(featured.length, 10);
  assert.deepEqual(featured.map(item => item.featuredRank), [1,2,3,4,5,6,7,8,9,10]);
});

test('creates content only from supplied feed fields', () => {
  const content = groundedContent(base, 'Kitco');
  assert.match(content.shortTitle, /Gold Bar/);
  assert.match(content.altText, /Kitco/);
  assert.equal(contentIsGrounded(content, base, 'Kitco'), true);
  assert.equal(contentIsGrounded({...content, instagramCaption: 'Only $999 today'}, base, 'Kitco'), false);
});

test('creates product schema without inventing an offer', () => {
  const seo = productSeo(base, 'Kitco');
  assert.equal(seo.canonicalUrl, 'https://estack.ca/ig/?product=product-1');
  assert.equal(seo.jsonLd.offers, undefined);
});

test('features only products with images, availability and approved tracking', () => {
  const dealer = {
    affiliateValidation: {
      hosts: ['www.awin1.com'],
      requiredQuery: {v: '84579', r: '2936205'}
    }
  };
  const eligible = {
    ...base,
    image: 'https://example.com/gold.webp',
    affiliateUrl: 'https://www.awin1.com/cread.php?s=3795009&v=84579&q=505826&r=2936205'
  };
  assert.equal(isShowroomEligible(eligible, dealer), true);
  assert.equal(isShowroomEligible({...eligible, image: ''}, dealer), false);
  assert.equal(isShowroomEligible({...eligible, affiliateUrl: '#'}, dealer), false);
  assert.equal(isShowroomEligible({...eligible, availability: 'out of stock'}, dealer), false);
});

test('adds offer schema only for engine-verified affiliate URLs', () => {
  const withoutVerification = productSeo({...base, affiliateUrl: 'https://example.com', price: 100}, 'Kitco');
  assert.equal(withoutVerification.jsonLd.offers, undefined);
  const verified = productSeo({...base, affiliateVerified: true, affiliateUrl: 'https://example.com', price: 100}, 'Kitco');
  assert.equal(verified.jsonLd.offers.url, 'https://example.com');
});
