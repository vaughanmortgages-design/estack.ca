import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {
  importProductsDetailed,
  isApprovedAffiliateUrl,
  STOREFRONT_CATEGORIES,
  toMetaCsv,
  toMetaXml
} from './lib/catalog-core.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const sourceArg = args.includes('--source') ? args[args.indexOf('--source') + 1] : '';
const skipSite = args.includes('--skip-site');
const rawSource = sourceArg || process.env.PRODUCT_SHEET_CSV_URL || path.join(repoRoot, 'data/products/source.json');
const source = /^https?:\/\//i.test(rawSource) ? rawSource : path.resolve(process.cwd(), rawSource);

if (!skipSite) {
  execFileSync(process.execPath, [path.join(repoRoot, 'scripts/build-bullion-store.mjs')], {cwd: repoRoot, stdio: 'inherit'});
}

const dealerData = JSON.parse(await fs.readFile(path.join(repoRoot, 'data/dealers/dealers.json'), 'utf8'));
const dealerMap = new Map(dealerData.dealers.map(dealer => [dealer.id, dealer]));
const dealerIds = new Set(dealerMap.keys());
const {products: allImportedProducts, duplicatesSkipped} = await importProductsDetailed(source);
const importedProducts = allImportedProducts.filter(product => product.active !== false);
const products = importedProducts.map(product => ({
  ...product,
  affiliateVerified: isApprovedAffiliateUrl(product.affiliateUrl, dealerMap.get(product.dealerId))
}));
const unknownDealers = [...new Set(products.filter(product => !dealerIds.has(product.dealerId)).map(product => product.dealerId))];
if (unknownDealers.length) throw new Error(`Unknown dealer ids: ${unknownDealers.join(', ')}`);

const generatedAt = new Date().toISOString();
const catalog = {
  schemaVersion: 1,
  generatedAt,
  sourceType: /^https?:\/\//.test(source) ? (source.includes('docs.google.com') ? 'google-sheets' : 'remote') : path.extname(source).slice(1),
  importReport: {duplicatesSkipped},
  products
};
await fs.writeFile(path.join(repoRoot, 'data/products/catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
await fs.writeFile(path.join(repoRoot, 'data/products/products.json'), `${JSON.stringify(catalog, null, 2)}\n`);
await fs.writeFile(path.join(repoRoot, 'products.json'), `${JSON.stringify(catalog, null, 2)}\n`);
await fs.writeFile(path.join(repoRoot, 'data/products/instagram.json'), `${JSON.stringify({...catalog, channel: 'social'}, null, 2)}\n`);

for (const category of STOREFRONT_CATEGORIES) {
  const categoryProducts = products.filter(product => product.category === category);
  await fs.writeFile(path.join(repoRoot, `data/products/${category}.json`), `${JSON.stringify({schemaVersion: 1, generatedAt, category, products: categoryProducts}, null, 2)}\n`);
}

await fs.writeFile(path.join(repoRoot, 'catalog.csv'), toMetaCsv(products, dealerData.dealers));
await fs.writeFile(path.join(repoRoot, 'catalog.xml'), toMetaXml(products, dealerData.dealers));

const sitemapPath = path.join(repoRoot, 'sitemap.xml');
let sitemap = await fs.readFile(sitemapPath, 'utf8');
const sitemapStart = '<!-- COMMERCE_PRODUCTS_START -->';
const sitemapEnd = '<!-- COMMERCE_PRODUCTS_END -->';
const productUrls = [...new Set(products
  .map(product => product.productPageUrl)
  .filter(url => typeof url === 'string' && url.startsWith('https://estack.ca/')))];
const productSitemap = `${sitemapStart}\n${productUrls.map(url => `  <url><loc>${url.replaceAll('&', '&amp;')}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`).join('\n')}\n${sitemapEnd}`;
const productBlockPattern = /<!-- COMMERCE_PRODUCTS_START -->[\s\S]*?<!-- COMMERCE_PRODUCTS_END -->/;
sitemap = productBlockPattern.test(sitemap)
  ? sitemap.replace(productBlockPattern, productSitemap)
  : sitemap.replace('</urlset>', `${productSitemap}\n</urlset>`);
await fs.writeFile(sitemapPath, sitemap);

const verifiedAffiliateLinks = products.filter(product => product.affiliateVerified).length;
const rejectedAffiliateLinks = products.filter(product => product.affiliateUrl && !product.affiliateVerified).map(product => product.id);
console.log(JSON.stringify({
  source,
  products: products.length,
  duplicatesSkipped,
  verifiedAffiliateLinks,
  rejectedAffiliateLinks,
  generatedAt
}, null, 2));
