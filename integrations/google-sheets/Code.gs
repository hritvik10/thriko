/**
 * Thriko enquiry form -> Google Sheets
 * Paste into Extensions > Apps Script of your Google Sheet, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */

const SHEET_NAME = 'Enquiries';

const HEADERS = [
  'Timestamp',
  'Full name',
  'Business email',
  'What do you need',
  'Country',
  'Budget',
  'Currency',
  'Budget not sure',
  'Desired timeline',
  'Project overview',
  'Founding Partner interest',
  'Consent',
  'Page URL',
];

const ALLOWED_SERVICES = ['Website', 'Mobile app', 'UI/UX design', 'AI integration'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const data = parseBody_(e);

    // 1) Shared secret: only your Next.js route knows it.
    //    Set it in Apps Script > Project Settings > Script Properties > SHARED_SECRET
    const secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || data.secret !== secret) {
      return json_({ ok: false, errors: ['Unauthorized.'] });
    }

    // 2) Honeypot: real users never fill this hidden field.
    if (data.company_website) return json_({ ok: true });

    const errors = validate_(data);
    if (errors.length) return json_({ ok: false, errors: errors });

    // 3) Rate limiting: per IP and per email, plus a daily cap.
    const limited = rateLimit_(data);
    if (limited) return json_({ ok: false, errors: [limited] });

    const sheet = getSheet_();
    const services = toArray_(data.services).filter(function (s) {
      return ALLOWED_SERVICES.indexOf(s) !== -1;
    });
    const notSure = toBool_(data.budgetNotSure);

    sheet.appendRow([
      new Date(),
      clean_(data.fullName, 200),
      clean_(data.email, 254),
      services.join(', '),
      clean_(data.country, 100),
      notSure ? '' : clean_(data.budget, 100),
      notSure ? '' : clean_(data.currency, 10),
      notSure ? 'Yes' : 'No',
      clean_(data.timeline, 100),
      clean_(data.overview, 2000),
      toBool_(data.foundingPartner) ? 'Yes' : 'No',
      toBool_(data.consent) ? 'Yes' : 'No',
      clean_(data.pageUrl, 500),
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, errors: ['Server error: ' + err.message] });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// Lets you open the web app URL in a browser to confirm it is live.
function doGet() {
  return json_({ ok: true, message: 'Thriko form endpoint is running.' });
}

// Run once from the editor to create the sheet + header row.
function setup() {
  getSheet_();
}

/* ---------- helpers ---------- */

// Limits (tweak as you like)
const LIMIT_PER_IP_PER_HOUR = 5;
const LIMIT_PER_EMAIL_PER_HOUR = 3;
const LIMIT_TOTAL_PER_DAY = 200;

// Returns an error message if over a limit, otherwise null.
// CacheService entries expire on their own, so counts reset automatically.
function rateLimit_(d) {
  const cache = CacheService.getScriptCache();
  const checks = [
    { key: 'ip:' + String(d.ip || 'unknown'), max: LIMIT_PER_IP_PER_HOUR, ttl: 3600 },
    { key: 'em:' + String(d.email || '').toLowerCase().trim(), max: LIMIT_PER_EMAIL_PER_HOUR, ttl: 3600 },
    { key: 'day:' + Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd'), max: LIMIT_TOTAL_PER_DAY, ttl: 86400 },
  ];
  for (let i = 0; i < checks.length; i++) {
    const c = checks[i];
    const count = Number(cache.get(c.key) || 0);
    if (count >= c.max) return 'Too many submissions. Please try again later.';
  }
  checks.forEach(function (c) {
    const count = Number(cache.get(c.key) || 0);
    cache.put(c.key, String(count + 1), c.ttl);
  });
  return null;
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function parseBody_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_) {
      // fall through to form-encoded params
    }
  }
  const p = (e && e.parameters) || {};
  const out = {};
  Object.keys(p).forEach(function (k) {
    out[k] = p[k].length > 1 ? p[k] : p[k][0];
  });
  return out;
}

function validate_(d) {
  const errors = [];
  if (!d.fullName || !String(d.fullName).trim()) errors.push('Full name is required.');
  if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email))) errors.push('A valid business email is required.');
  if (!toArray_(d.services).length) errors.push('Choose at least one service.');
  if (!d.country) errors.push('Country is required.');
  if (!toBool_(d.budgetNotSure) && !d.budget) errors.push('Budget is required (or tick "Not sure yet").');
  if (!d.timeline) errors.push('Desired timeline is required.');
  if (d.overview && String(d.overview).length > 2000) errors.push('Project overview must be 2000 characters or fewer.');
  if (!toBool_(d.consent)) errors.push('Consent is required.');
  return errors;
}

function toArray_(v) {
  if (Array.isArray(v)) return v.map(String);
  if (v == null || v === '') return [];
  return String(v).split(',').map(function (s) { return s.trim(); }).filter(String);
}

function toBool_(v) {
  return v === true || v === 'true' || v === 'on' || v === 'yes' || v === '1';
}

// Trims, caps length, and blocks spreadsheet formula injection.
function clean_(v, max) {
  let s = v == null ? '' : String(v).trim().slice(0, max || 500);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
