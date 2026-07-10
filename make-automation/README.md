# eStack Make Automation Templates

This folder documents the automation workflow for syncing the PM Digital Content Studio with eStack.

## Goal

Use Google Sheets as the control center, Google Drive as the asset library, OpenAI for content generation, and Make.com for scheduled automation.

## Core Workflow

1. Google Sheet: PM Digital Content Studio
2. Tab: Affiliate Vault
3. Apps Script: `google-apps-script/Affiliate_Vault_Export.gs`
4. Output file: `data/affiliate-links.json`
5. Website: eStack.ca reads the JSON file for live affiliate cards and partner placements.

## Required Make.com modules

- Google Sheets: Watch Rows
- Google Sheets: Get a Row
- Google Drive: Search Files
- OpenAI: Create Completion / Generate Text
- HTTP: Make a Request
- Router: Split by brand or content type
- Gmail or Google Sheets: Send approval / log result

## Safety Rules

- Do not publish unapproved affiliate links.
- Keep Canada and United States campaigns separate.
- Keep VMG mortgage content separate from eStack affiliate finance content.
- Do not overwrite `data/affiliate-links.json` unless the Affiliate Vault status is approved or placed.
- Store GitHub tokens only in secure script properties or Make.com encrypted connections.
