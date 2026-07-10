# Make.com Scenario Template

## Scenario: Affiliate Vault Sync

### Trigger

Google Sheets → Watch Rows

- Spreadsheet: PM Digital Content Studio
- Sheet: Affiliate Vault
- Watch changes where Status is Approved or Placed

### Steps

1. Google Sheets → Watch Rows
2. Filter → Status is Approved OR Placed
3. Google Sheets → Get Range Values from Affiliate Vault
4. Tools → Compose JSON array
5. HTTP → PUT GitHub contents API
6. Google Sheets → Update row note / timestamp

### GitHub API request

Method: `PUT`

URL:

```text
https://api.github.com/repos/vaughanmortgages-design/estack.ca/contents/data/affiliate-links.json
```

Headers:

```text
Authorization: Bearer {{GITHUB_TOKEN}}
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
Content-Type: application/json
```

Body:

```json
{
  "message": "Sync affiliate links from Affiliate Vault",
  "content": "{{base64_json_content}}",
  "sha": "{{existing_file_sha}}",
  "branch": "main"
}
```

## Scenario: Content Draft Generator

1. Google Sheets → Watch Rows in Content Library
2. Filter → Status is Idea
3. OpenAI → Generate draft
4. Google Sheets → Update Hook, Caption / Body, CTA, Hashtags
5. Google Sheets → Set Status to Needs Review

## Scenario: Asset Lookup

1. Google Sheets → Watch Rows in Publishing Calendar
2. Google Drive → Search Files by Asset ID or topic
3. Google Sheets → Update Asset Link
4. Router → send to platform-specific publishing prep
