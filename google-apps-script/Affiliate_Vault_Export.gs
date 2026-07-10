const AFFILIATE_EXPORT_CONFIG = {
  sheetName: 'Affiliate Vault',
  githubOwner: 'vaughanmortgages-design',
  githubRepo: 'estack.ca',
  githubBranch: 'main',
  githubPath: 'data/affiliate-links.json',
  tokenPropertyName: 'GITHUB_TOKEN'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Affiliate Vault')
    .addItem('Preview JSON Export', 'previewAffiliateVaultJson')
    .addItem('Export to GitHub JSON', 'exportAffiliateVaultToGitHub')
    .addItem('Set GitHub Token', 'setGitHubTokenPrompt')
    .addToUi();
}

function previewAffiliateVaultJson() {
  const json = buildAffiliateLinksJson_();
  const html = HtmlService.createHtmlOutput('<pre style="white-space:pre-wrap;font:12px monospace;">' + escapeHtml_(json) + '</pre>')
    .setWidth(900)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Affiliate Links JSON Preview');
}

function exportAffiliateVaultToGitHub() {
  const token = PropertiesService.getScriptProperties().getProperty(AFFILIATE_EXPORT_CONFIG.tokenPropertyName);
  if (!token) {
    throw new Error('Missing GitHub token. Run Set GitHub Token first.');
  }

  const json = buildAffiliateLinksJson_();
  const file = getGitHubFile_(token);

  const payload = {
    message: 'Sync affiliate links from Affiliate Vault',
    content: Utilities.base64Encode(json),
    branch: AFFILIATE_EXPORT_CONFIG.githubBranch
  };

  if (file && file.sha) {
    payload.sha = file.sha;
  }

  const url = githubContentsUrl_();
  const response = UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('GitHub export failed: HTTP ' + code + ' - ' + response.getContentText());
  }

  SpreadsheetApp.getUi().alert('Affiliate Vault exported to ' + AFFILIATE_EXPORT_CONFIG.githubPath + '.');
}

function setGitHubTokenPrompt() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt('Set GitHub Token', 'Paste a GitHub fine-grained token with contents read/write access to estack.ca:', ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() !== ui.Button.OK) return;

  const token = result.getResponseText().trim();
  if (!token) {
    ui.alert('No token saved.');
    return;
  }

  PropertiesService.getScriptProperties().setProperty(AFFILIATE_EXPORT_CONFIG.tokenPropertyName, token);
  ui.alert('GitHub token saved in Script Properties.');
}

function buildAffiliateLinksJson_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(AFFILIATE_EXPORT_CONFIG.sheetName);
  if (!sheet) throw new Error('Missing sheet: ' + AFFILIATE_EXPORT_CONFIG.sheetName);

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return '[]\n';

  const headers = values[0].map(normalizeHeader_);
  const rows = values.slice(1);

  const partners = rows
    .map(row => rowToAffiliateObject_(headers, row))
    .filter(item => item.name && item.affiliateUrl);

  return JSON.stringify(partners, null, 2) + '\n';
}

function rowToAffiliateObject_(headers, row) {
  const get = key => {
    const index = headers.indexOf(key);
    return index === -1 ? '' : String(row[index] || '').trim();
  };

  const approvedRaw = get('status') || get('approved');

  return {
    name: get('merchant') || get('name') || get('productname'),
    category: get('category'),
    country: get('country') || get('market'),
    network: get('network'),
    affiliateUrl: get('affiliatelink') || get('affiliateurl') || get('link'),
    logo: get('logo') || buildDefaultLogoPath_(get('merchant') || get('name') || get('productname')),
    description: get('description') || get('notes'),
    approved: isApproved_(approvedRaw)
  };
}

function normalizeHeader_(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isApproved_(value) {
  const v = String(value || '').trim().toLowerCase();
  return ['approved', 'placed', 'yes', 'true', 'active'].indexOf(v) !== -1;
}

function buildDefaultLogoPath_(name) {
  if (!name) return '';
  return '/assets/logos/' + String(name)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.png';
}

function getGitHubFile_(token) {
  const url = githubContentsUrl_() + '?ref=' + encodeURIComponent(AFFILIATE_EXPORT_CONFIG.githubBranch);
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    muteHttpExceptions: true
  });

  if (response.getResponseCode() === 404) return null;
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error('Could not read GitHub file: HTTP ' + response.getResponseCode() + ' - ' + response.getContentText());
  }

  return JSON.parse(response.getContentText());
}

function githubContentsUrl_() {
  return 'https://api.github.com/repos/'
    + encodeURIComponent(AFFILIATE_EXPORT_CONFIG.githubOwner)
    + '/'
    + encodeURIComponent(AFFILIATE_EXPORT_CONFIG.githubRepo)
    + '/contents/'
    + AFFILIATE_EXPORT_CONFIG.githubPath.split('/').map(encodeURIComponent).join('/');
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
