# OpenAI Template

## Purpose

Generate draft content from approved rows in PM Digital Content Studio.

## Inputs

- Brand
- Platform
- Content Type
- Topic
- Product or affiliate merchant
- CTA
- Destination URL
- Compliance notes

## Prompt template

```text
You are creating marketing content for {{brand}}.

Platform: {{platform}}
Content type: {{content_type}}
Topic: {{topic}}
Destination URL: {{destination_url}}
CTA: {{cta}}
Compliance notes: {{compliance_notes}}

Write a clean, direct draft that is useful, not hypey.
Avoid guarantees, exaggerated claims, or misleading financial promises.
Return:
1. Hook
2. Caption/body
3. CTA
4. Hashtags if relevant
```

## Output fields

Write the generated content back to:

- Content Library → Hook
- Content Library → Caption / Body
- Content Library → CTA
- Content Library → Hashtags
- Content Library → Status = Needs Review
