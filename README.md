# Thriko website

Marketing site for **Thriko** (logo: the "Brace 3co" wordmark). It has a React frontend and a small Python API that saves quote requests to an Excel workbook.

- **Home** (`/`): hero with an animated project-blueprint card, services, the premium AI Studio section (LLMs, MCP servers, agentic workflows, AI software), example builds, process, why Thriko, the Founding Partner program, tech stack, FAQ, and a closing call to action.
- **Request a quote** (`/contact`): a validated form plus a contact panel. Each submission becomes a row in `backend/data/enquiries.xlsx`.

## Quick start (development)

You need Node 20+ and Python 3.10+. Use two terminals.

```bash
# 1) API (http://127.0.0.1:8000, docs at /api/docs)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

```bash
# 2) Website (http://localhost:5173)
cd frontend
npm install
cp .env.example .env
npm run dev
```

The Vite dev server proxies `/api/*` to the Python API, so the form works with no CORS setup.

## Checks

```bash
cd frontend && npm run typecheck && npm run lint && npm test && npm run build
cd backend  && .venv/bin/python -m pytest
```

## Production

The simplest setup is one process that serves both the built site and the API:

```bash
cd frontend && npm ci && npm run build
cd ../backend
THRIKO_FRONTEND_DIST=../frontend/dist \
THRIKO_ALLOWED_ORIGINS=https://thriko.com \
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

Put it behind HTTPS (Nginx, Caddy or your host's load balancer). If the proxy sets `X-Forwarded-For`, also set `THRIKO_TRUST_PROXY_HEADERS=true` so rate limiting sees real client IPs.

**Cloudflare Workers:** the site deploys from `frontend/` using `frontend/wrangler.jsonc`. Set root directory `frontend`, build command `npm run build` and deploy command `npx wrangler deploy`. The quote form needs the Python API hosted separately.

Prefer to host the frontend separately (Vercel, Netlify, S3)? Build with `VITE_API_BASE_URL=https://api.thriko.com` and add the site's origin to `THRIKO_ALLOWED_ORIGINS`.

> **Excel storage.** The workbook must live on a persistent disk on a single server. Serverless or multi-server hosting would lose or split the file. If you outgrow that, swap `ExcelEnquiryStore` for a database or a Google Sheets/Microsoft 365 integration; the route handler doesn't change.

## Storing enquiries in a Google Sheet instead (no server)

The Python API needs a host with a persistent disk, which is the only part of
this project that costs money. To avoid that, the form can post to a Google
Apps Script web app that appends rows to a Google Sheet you own, using the same
columns, so the sheet downloads as a matching `.xlsx`.

The script, its field names and the setup are documented in
[`integrations/google-sheets/README.md`](integrations/google-sheets/README.md).

In production the browser does not call Google directly. It posts to
`/api/enquiries` on your own domain, handled by the Cloudflare Worker in
`frontend/src/worker/`, which verifies a Cloudflare Turnstile token, validates
the payload and forwards it to Apps Script signed with a shared secret. The
Worker deploys with the site, so there is still only one `npx wrangler deploy`.

Worker secrets (never in the bundle, never in git):

```bash
cd frontend
npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_URL
npx wrangler secret put SHEETS_SHARED_SECRET
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Locally those three live in `frontend/.dev.vars` for `npx wrangler dev`. The
browser only needs `VITE_TURNSTILE_SITE_KEY` in `frontend/.env`, which is public
by design; leave it empty and the bot check is skipped, which is what
`npm run dev` against the Python API does.

## How the form → Excel flow works

1. `EnquiryForm.tsx` validates in the browser (`validation.ts`) and POSTs JSON to `/api/enquiries`.
2. FastAPI validates again (`schemas.py`). Unknown fields and values outside the allowed lists are rejected with a 422 error, and the form shows those errors next to the matching fields.
3. `excel_store.py` appends a row while holding a file lock (safe with several workers). It saves via a temporary file plus an atomic rename, and forces text cells so formula-like input such as `=HYPERLINK(...)` can't execute.
4. The response carries a reference such as `TH-4F9A2C`, which matches the row's **Reference** column.

The spreadsheet has a **Status** column (default `New`) your team can update as leads progress.

**Tip:** don't keep the live workbook open in Excel on Windows. Excel locks the file and new submissions fail with a 503 (logged clearly). Open a copy instead.

### Spam & abuse protection

- Hidden honeypot field: bot submissions get a fake success and aren't stored.
- Rate limit per IP (default 5 per minute, see `.env.example`).
- Strict schema with length limits on every field.
- Logs contain references and project types only, never names, emails or messages.

## Project structure

```
shared/markets.json          ← countries + budget ranges (used by both apps)
frontend/
  src/
    content/site.ts          ← all marketing copy (edit text here)
    styles/tokens.css        ← colours, fonts, spacing
    components/
      brand/Logo.tsx         ← Brace 3co logo
      layout/                ← Header, Footer, SiteLayout, navigation
      ui/                    ← Button, Container, Icon, Reveal, SectionHeading
    sections/home/           ← one file (+ CSS module) per home-page section
    features/enquiry/        ← form, validation (+ tests), API client, options
    pages/                   ← HomePage, ContactPage, NotFoundPage
    routes.ts, config.ts
backend/
  app/
    main.py                  ← app factory, CORS, health, optional static site
    config.py                ← settings (THRIKO_* env vars)
    schemas.py               ← request validation + spreadsheet labels
    api/enquiries.py         ← POST /api/enquiries
    services/excel_store.py  ← Excel writer
    services/rate_limiter.py
  tests/test_enquiries.py
```

### Countries & local-currency budgets

The quote form asks for the visitor's country first. The visitor then types their budget as a number in that country's currency, or ticks "Not sure yet". Countries live in **one file**, `shared/markets.json`, which both the frontend and backend read, listed in priority order. Each country has:

- `currency` and `locale`: e.g. `INR` / `en-IN`, which formats amounts as ₹4,00,000.
- `lowBudgetBelow`: amounts below this show the green "affordable prices guaranteed" note.

To add a country or change thresholds, edit only that file. The backend checks it at startup. In Excel, **Currency** and **Budget** are separate columns, and the budget is a real number you can sort and filter.

Current target markets: United States, United Kingdom, Canada, Australia, UAE, Germany, Singapore, India, plus "Other country" (priced in USD, with a free-text country name).

**Keep in sync:** project types and timelines live in `frontend/src/features/enquiry/options.ts` and `backend/app/schemas.py`. Change both together.

## Debugging

- API docs and a live "try it" console: `http://127.0.0.1:8000/api/docs`.
- In development, failed submissions are logged to the browser console with the full error (`[EnquiryForm] submission failed`).
- Set `THRIKO_LOG_LEVEL=DEBUG` for verbose server logs.
- Production builds generate source maps (`dist/assets/*.map`) for debugging, but the public JavaScript doesn't link to them. Don't upload the `.map` files if you don't want your source readable.

## Browser support & performance

- **Supported browsers:** Chrome/Edge 90+, Firefox 90+, Safari and iOS 15+, and Samsung Internet. That's everything from roughly the last four years. Targets are set in `vite.config.ts`, and the build adds any Safari prefixes it needs.
- **Loading:** the home page loads first. The contact page and form load separately, and are fetched in the background once the browser is idle, so "Get a Quote" opens instantly.
- **Fonts:** only the weights the design uses, with `display=swap`, so text appears immediately.
- **Accessibility:** works with keyboard and screen readers, respects "reduce motion", has 44px tap targets and 16px form text (so iPhones don't zoom in), and meets WCAG AA colour contrast.

## Before launch: placeholders to replace

- `career@thriko.com`: set `VITE_CONTACT_EMAIL` to your real address.
- Social links in `components/layout/Footer.tsx` (marked `TODO`).
- Terms of Service link in the footer (marked `TODO`); the Privacy Policy page exists at `/privacy`.
- Legal details in `frontend/src/content/legal.ts` (marked `TODO`): registered company name and postal address. The Privacy Policy has to name the legal entity and a real address, and its retention periods and listed service providers should be confirmed before launch.
- Office hours text in the footer and on the contact page.
