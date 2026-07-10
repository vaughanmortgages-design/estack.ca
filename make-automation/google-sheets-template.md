# Google Sheets Template

## Trigger

Watch rows in `PM Digital Content Studio`.

## Recommended watched tabs

- Affiliate Vault
- Products
- Content Library
- Publishing Calendar
- Image Library
- Website Pages
- Analytics

## Affiliate Vault required columns

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

## Export condition

Only export rows where `Status` is one of:

- Approved
- Placed
- Active

## Output JSON fields

```json
{
  "name": "Merchant Name",
  "category": "Category",
  "country": "CA & USA",
  "network": "Network Name",
  "affiliateUrl": "https://example.com/link",
  "logo": "/assets/logos/merchant-name.png",
  "description": "Short partner description.",
  "approved": true
}
```
