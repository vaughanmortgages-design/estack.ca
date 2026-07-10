# Affiliate Vault Export Workflow

## Purpose

Export approved affiliate rows from the PM Digital Content Studio Google Sheet into the existing eStack JSON format at:

```text
data/affiliate-links.json
```

The export must update affiliate data only and must not change unrelated website files.

## Existing JSON structure

The file is an array of partner objects:

```json
[
  {
    "name": "Beehiiv",
    "category": "Newsletter Publishing",
    "country": "CA & USA",
    "network": "Beehiiv Direct",
    "affiliateUrl": "https://www.beehiiv.com/?via=paul-malandrino",
    "logo": "/assets/logos/beehiiv.png",
    "description": "Audience growth and newsletter publishing platform built for creators and media brands.",
    "approved": true
  }
]
```

## Sheet source

Spreadsheet: `PM Digital Content Studio`

Tab: `Affiliate Vault`

Recommended columns:

- Affiliate ID
- Brand
- Market
- Network
- Merchant
- Category
- Status
- Affiliate Link
- Tracking ID
- Commission
- Approved Date
- Placed On Page
- Contact / Login
- Notes

## Export mapping

| Affiliate Vault column | JSON field |
|---|---|
| Merchant | name |
| Category | category |
| Market / Country | country |
| Network | network |
| Affiliate Link | affiliateUrl |
| Logo | logo |
| Description / Notes | description |
| Status | approved |

## Export conditions

Export rows only when:

- Merchant is not blank.
- Affiliate Link is not blank.
- Status is Approved, Placed, Active, Yes, or True.

## Apps Script

Use:

```text
google-apps-script/Affiliate_Vault_Export.gs
```

Required Script Property:

```text
GITHUB_TOKEN
```

The token must have contents read/write access to:

```text
vaughanmortgages-design/estack.ca
```

## Manual test checklist

1. Open PM Digital Content Studio.
2. Confirm `Affiliate Vault` tab exists.
3. Confirm approved partner rows have Merchant, Category, Market, Network, Affiliate Link, and Status.
4. Open Apps Script.
5. Run `Preview JSON Export` from the Affiliate Vault menu.
6. Confirm JSON structure matches `data/affiliate-links.json`.
7. Run `Export to GitHub JSON`.
8. Confirm only `data/affiliate-links.json` changes.
9. Open a pull request for review before deploying the data change.

## Safety rules

- Do not export unapproved programs.
- Do not mix eStack Canada and eStack U.S. partner rules unless the Market allows both.
- Do not place VMG mortgage lead links inside eStack affiliate JSON.
- Do not overwrite unrelated site files.
