import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {importProducts, toMetaCsv, toMetaXml, isPlaceholderUrl} from './lib/catalog-core.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const sourceArg = args.includes('--source') ? args[args.indexOf('--source') + 1] : '';
const skipSite = args.includes('--skip-site');
const rawSource = sourceArg || process.env.PRODUCT_SHEET_CSV_URL || path.join(repoRoot, 'data/products/source.json');
const source = /^https?:\/\//i.test(rawSource) ? rawSource : path.resolve(process.cwd(), rawSource);
const storefrontCategories = ['gold-bars', 'gold-coins', 'silver-bars', 'silver-coins', 'platinum', 'palladium', 'copper', 'vault-products', 'collectibles', 'deals'];

if (!skipSite) {
  execFileSync(process.execPath, [path.join(repoRoot, 'scripts/build-bullion-store.mjs')], {cwd: repoRoot, stdio: 'inherit'});
}

const dealerData = JSON.parse(await fs.readFile(path.join(repoRoot, 'data/dealers/dealers.json'), 'utf8'));
const dealerIds = new Set(dealerData.dealers.map(dealer => dealer.id));
const products = await importProducts(source);
const unknownDealers = [...new Set(products.filter(product => !dealerIds.has(product.dealerId)).map(product => product.dealerId))];
if (unknownDealers.length) throw new Error(`Unknown dealer ids: ${unknownDealers.join(', ')}`);

const generatedAt = new Date().toISOString();
const catalog = {
  schemaVersion: 1,
  generatedAt,
  sourceType: /^https?:\/\//.test(source) ? (source.includes('docs.google.com') ? 'google-sheets' : 'remote') : path.extname(source).slice(1),
  products
};
await fs.writeFile(path.join(repoRoot, 'data/products/catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
await fs.writeFile(path.join(repoRoot, 'data/products/instagram.json'), `${JSON.stringify({...catalog, channel: 'social'}, null, 2)}\n`);

for (const category of storefrontCategories) {
  const categoryProducts = products.filter(product => product.category === category);
  await fs.writeFile(path.join(repoRoot, `data/products/${category}.json`), `${JSON.stringify({schemaVersion: 1, generatedAt, category, products: categoryProducts}, null, 2)}\n`);
}

await fs.writeFile(path.join(repoRoot, 'catalog.csv'), toMetaCsv(products, dealerData.dealers));
await fs.writeFile(path.join(repoRoot, 'catalog.xml'), toMetaXml(products, dealerData.dealers));

const sitemapPath = path.join(repoRoot, 'sitemap.xml');
let sitemap = await fs.readFile(sitemapPath, 'utf8');
for (const product of products) {
  if (!product.productPageUrl || !product.productPageUrl.startsWith('https://estack.ca/')) continue;
  if (sitemap.includes(`<loc>${product.productPageUrl}</loc>`)) continue;
  sitemap = sitemap.replace('</urlset>', `  <url><loc>${product.productPageUrl}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>\n</urlset>`);
}
await fs.writeFile(sitemapPath, sitemap);

const metaReadyCount = products.filter(product => !isPlaceholderUrl(product.affiliateUrl)).length;
console.log(JSON.stringify({source, products: products.length, affiliateLinksPresent: metaReadyCount, generatedAt}, null, 2));
