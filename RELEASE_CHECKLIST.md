# eStack Version 1 Release Checklist

Status: Production data activation and business approval pending

Use this checklist with:

- `PRODUCT_OPERATIONS.md` for the production catalog schema and product lifecycle;
- `IMPORT_PROCESS.md` for the catalog refresh and validation procedure;
- `FINAL_LAUNCH_CHECKLIST.md` for detailed merchant and storefront acceptance;
- `docs/version-1-release-package.md` for architecture, risks, and release ownership.

Do not merge or start a production deployment until every required item below
has been completed and the release owner has approved the result.

## 1. Environment and source

- [ ] Environment variables configured.
- [ ] The required GitHub Actions secret `PRODUCT_SHEET_CSV_URL` is configured.
- [ ] `PRODUCT_SHEET_CSV_URL` contains the published product-tab CSV URL, not a
      Google Sheet edit URL.
- [ ] The optional `AI_CONTENT_WEBHOOK_URL` is either intentionally unset or
      points to the approved Make.com webhook.
- [ ] No secret value, private Sheet URL, credential, or API key is committed
      to the repository or generated catalog.
- [ ] Google Sheet published.
- [ ] The published Sheet uses the exact production columns documented in
      `PRODUCT_OPERATIONS.md`.
- [ ] The published CSV opens without authentication and returns the expected
      header and product rows.
- [ ] CSV URL verified.

## 2. Catalog import and outputs

- [ ] Run **Refresh commerce catalog** manually on the PR #12 branch without a
      temporary source override.
- [ ] Import completed successfully.
- [ ] Imported active product count is greater than zero.
- [ ] Invalid, skipped, inactive, and duplicate rows are reviewed and
      understood.
- [ ] Duplicate product ID count is zero.
- [ ] Active products have valid titles, merchants, product URLs, affiliate
      URLs, and image URLs.
- [ ] `products.json` verified.
- [ ] `catalog.csv` verified.
- [ ] `catalog.xml` verified.
- [ ] Product counts in `products.json`, `catalog.csv`, and `catalog.xml` match
      for products eligible for Meta export.
- [ ] Generated category feeds and `featured-products.json` contain the
      expected curated products.
- [ ] The validation report and import log show no unexplained errors.

## 3. Merchant and affiliate handoff

- [ ] Money Metals Shop Now handoff reaches the approved tracked destination.
- [ ] Kitco Shop Now handoff reaches the approved tracked destination.
- [ ] Sprott Shop Now handoff reaches the merchant-issued tracked destination.
- [ ] The Sprott query value remains exactly
      `acc=paul-maladrino-5887a`; do not normalize the issued spelling.
- [ ] Shop Now links use the stored affiliate URL without modification.
- [ ] Missing, invalid, placeholder, or unapproved affiliate URLs do not render
      as purchase buttons.
- [ ] External purchase links use `rel="sponsored nofollow noopener noreferrer"`.

## 4. Storefront acceptance

- [ ] Homepage verified.
- [ ] Today’s Picks and supporting curated sections display expected products.
- [ ] Category pages verified.
- [ ] Gold, Silver, and Platinum category pages display curated products.
- [ ] Product pages verified.
- [ ] Product detail pages show the correct title, merchant, supplied price,
      description, and related products.
- [ ] Shop Now links verified.
- [ ] Images verified.
- [ ] All product and category images load without broken requests.
- [ ] Search and storefront filters return the expected products.
- [ ] Internal navigation and breadcrumbs resolve correctly.
- [ ] Mobile verified.
- [ ] Desktop, tablet, and mobile layouts are usable without clipping,
      horizontal overflow, or inaccessible controls.

## 5. SEO, runtime, and feeds

- [ ] SEO verified.
- [ ] Canonical URLs, Open Graph tags, and Twitter Card metadata are correct.
- [ ] Product structured data validates for at least one live product.
- [ ] Breadcrumb structured data validates on category and product views.
- [ ] `sitemap.xml` contains the expected storefront and active product URLs.
- [ ] `robots.txt` references the production sitemap.
- [ ] Catalog and private JSON feeds retain the intended `X-Robots-Tag`
      headers.
- [ ] No console errors.
- [ ] No runtime errors.
- [ ] Automated catalog tests pass.
- [ ] Production build completes without blocking warnings.
- [ ] Internal link and missing-image checks pass.

## 6. Merge and deployment sequence

- [ ] Confirm PR #12 still targets `main` and contains only the reviewed
      Version 1 release changes.
- [ ] Confirm the latest PR head has a successful Netlify Deploy Preview.
- [ ] Complete business review in that Deploy Preview.
- [ ] Record business approval to merge.
- [ ] Merge PR #12 only after explicit approval.
- [ ] Confirm the connected Netlify production build starts from the approved
      `main` commit.
- [ ] Confirm the Netlify production build succeeds before treating the release
      as live.
- [ ] Run the homepage, category, product, mobile, SEO, image, and affiliate
      handoff checks again on the production URL.
- [ ] Confirm the next scheduled catalog refresh completes successfully on
      `main`.
- [ ] Record the production commit, catalog generation time, and release owner.

## Release sign-off

- [ ] Engineering sign-off complete.
- [ ] Catalog operations sign-off complete.
- [ ] Affiliate-link sign-off complete.
- [ ] Business approval complete.
- [ ] Production smoke test complete.
- [ ] No blocking issue remains open.
