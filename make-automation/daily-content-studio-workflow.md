# Daily Content Studio Workflow

## Purpose

Turn the PM Digital Content Studio Google Sheet into the daily control center for eStack content planning, content generation, asset lookup, publishing prep, and performance tracking.

## Source tabs

- Dashboard
- Master Tasks
- Content Library
- Publishing Calendar
- Affiliate Vault
- Products
- Image Library
- Keywords
- Website Pages
- Analytics
- Ideas

## Daily workflow

1. Review Dashboard for open tasks, scheduled posts, published posts, affiliate status, and revenue.
2. Review Ideas and promote selected ideas into Content Library.
3. Use OpenAI to draft hook, caption/body, CTA, hashtags, and blog outlines.
4. Use Google Drive to attach approved images and Canva links from Image Library.
5. Move approved content into Publishing Calendar.
6. Publish manually or through the selected platform workflow.
7. Log published URL, clicks, leads, conversions, and revenue into Analytics.
8. Feed strong performers back into Ideas and Content Library for repurposing.

## Make.com scenario outline

### Trigger

Google Sheets → Watch Rows

- Sheet: Content Library
- Condition: Status equals `Idea`

### Actions

1. OpenAI → Generate draft content.
2. Google Sheets → Update Hook, Caption / Body, CTA, Hashtags.
3. Google Sheets → Set Status to `Needs Review`.
4. Google Drive → Search for matching image assets.
5. Google Sheets → Write asset links to Content Library.
6. Router → Split by Brand and Platform.
7. Google Sheets → Add ready items to Publishing Calendar.

## Brand separation rules

- VMG mortgage content stays separate from eStack affiliate content.
- eStack Canada and eStack U.S. content must stay market-specific.
- The Straight Cut ecommerce content should not use VMG mortgage compliance language.
- Affiliate links should only be used when the program is approved or placed.

## Review statuses

- Idea: raw concept only.
- Draft: content exists but not approved.
- Needs Review: ready for manual approval.
- Approved: can be scheduled.
- Scheduled: ready to publish.
- Published: live and logged.
