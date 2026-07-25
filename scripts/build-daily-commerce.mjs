import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {detectProductChanges, generateProductContent, productSeo, scoreProduct, selectDailyFeatured} from './lib/daily-commerce-core.mjs';
import {toMetaCsv, toMetaXml} from './lib/catalog-core.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const sourceArg = args.includes('--source') ? args[args.indexOf('--source') + 1] : '';
const rawSource = sourceArg || process.env.PRODUCT_SHEET_CSV_URL || path.join(repoRoot, 'data/products/source.json');
const source = /^https?:\/\//i.test(rawSource) ? rawSource : path.resolve(process.cwd(), rawSource);
const statePath = path.join(repoRoot, 'data/products/import-state.json');
const logPath = path.join(repoRoot, 'data/analytics/product-import-log.jsonl');
const analyticsPath = path.join(repoRoot, 'data/analytics/products.json');

await fs.mkdir(path.dirname(logPath), {recursive: true});
let previousState = {};
try {
  previousState = JSON.parse(await fs.readFile(statePath, 'utf8')).products || {};
} catch {
  previousState = {};
}

execFileSync(process.execPath, [path.join(repoRoot, 'scripts/build-commerce-engine.mjs'), '--source', source], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env
});

const catalogPath = path.join(repoRoot, 'data/products/catalog.json');
const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
const dealerData = JSON.parse(await fs.readFile(path.join(repoRoot, 'data/dealers/dealers.json'), 'utf8'));
const dealerMap = new Map(dealerData.dealers.map(dealer => [dealer.id, dealer]));
const now = new Date();
const changes = detectProductChanges(catalog.products, previousState);

const scored = [];
for (const product of catalog.products) {
  const dealer = dealerMap.get(product.dealerId);
  const score = scoreProduct(product, now);
  const content = await generateProductContent(product, dealer?.name || product.dealerId);
  const enriched = {...product, ...score, content};
  enriched.seo = productSeo(enriched, dealer?.name || product.dealerId);
  scored.push(enriched);
}

const selectedIds = new Set(selectDailyFeatured(scored, 10, now).map(product => product.id));
const products = scored.map(product => ({...product, dailyFeatured: selectedIds.has(product.id)}));
const featured = products.filter(product => product.dailyFeatured)
  .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
  .map((product, index) => ({...product, featuredRank: index + 1}));
const generatedAt = now.toISOString();

await fs.writeFile(catalogPath, `${JSON.stringify({...catalog, generatedAt, products}, null, 2)}\n`);
await fs.writeFile(path.join(repoRoot, 'data/products/featured-products.json'), `${JSON.stringify({schemaVersion: 1, generatedAt, products: featured}, null, 2)}\n`);
await fs.writeFile(path.join(repoRoot, 'data/products/instagram.json'), `${JSON.stringify({schemaVersion: 1, generatedAt, channel: 'social', products}, null, 2)}\n`);
await fs.writeFile(path.join(repoRoot, 'catalog.csv'), toMetaCsv(products, dealerData.dealers));
await fs.writeFile(path.join(repoRoot, 'catalog.xml'), toMetaXml(products, dealerData.dealers));

for (const category of [...new Set(products.map(product => product.category).filter(Boolean))]) {
  const categoryProducts = products.filter(product => product.category === category);
  await fs.writeFile(path.join(repoRoot, `data/products/${category}.json`), `${JSON.stringify({schemaVersion: 1, generatedAt, category, products: categoryProducts}, null, 2)}\n`);
}

const state = {
  schemaVersion: 1,
  importedAt: generatedAt,
  products: Object.fromEntries(Object.entries(changes.current).map(([id, value]) => [id, {...value, importedAt: generatedAt}]))
};
await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);

const analytics = products.map(product => ({
  importDate: generatedAt,
  merchant: dealerMap.get(product.dealerId)?.name || product.dealerId,
  category: product.category,
  productId: product.id,
  featured: product.dailyFeatured,
  score: product.score
}));
await fs.writeFile(analyticsPath, `${JSON.stringify({schemaVersion: 1, generatedAt, events: analytics}, null, 2)}\n`);

const log = {
  importDate: generatedAt,
  sourceType: catalog.sourceType,
  total: products.length,
  added: changes.added,
  changed: changes.changed,
  unchanged: changes.unchanged.length,
  removed: changes.removed,
  featured: featured.map(product => product.id)
};
await fs.appendFile(logPath, `${JSON.stringify(log)}\n`);
console.log(JSON.stringify(log, null, 2));
