# Enquiries → Google Sheet

`Code.gs` is the Apps Script deployed behind the Thriko quote form. Keep this
copy in step with what is actually deployed: it is the only version in source
control, and a mismatch between the two is hard to spot and easy to cause.

## How it is wired

The browser never talks to Apps Script. It posts to `/api/enquiries` on our own
domain, which the Cloudflare Worker in `frontend/src/worker/` handles:

```
Browser (Turnstile widget, site key is public)
  │ POST /api/enquiries   ← same origin, carries no secrets
  ▼
Cloudflare Worker        ← TURNSTILE_SECRET_KEY, SHEETS_SHARED_SECRET, WEBHOOK_URL
  ├─ verifies the Turnstile token with Cloudflare
  ├─ drops honeypot hits and implausibly fast submissions
  ├─ validates the payload
  └─ POSTs to this Apps Script, signed with the shared secret
       ▼
     Google Sheet
```

The Worker ships with the site, so `npx wrangler deploy` deploys both.

## Field names

The script uses its own names, which are **not** the ones the form posts. The
Worker's `toSheetsPayload()` does the translation, and it also converts codes to
the labels the sheet stores:

| Form payload | Script field | Stored as |
|---|---|---|
| `name` | `fullName` | Full name |
| `email` | `email` | Business email |
| `project_types: ["ai"]` | `services: ["AI integration"]` | What do you need |
| `country: "GB"` | `country: "United Kingdom"` | Country |
| `budget_amount` | `budget` + `currency` | Budget, Currency |
| `budget_not_sure` | `budgetNotSure` | Budget not sure |
| `timeline: "1_3_months"` | `timeline: "1–3 months"` | Desired timeline |
| `message` | `overview` | Project overview |
| `partner_program` | `foundingPartner` | Founding Partner interest |
| — | `ip` | (rate limiting only) |
| — | `pageUrl` | Page URL |

Two traps worth knowing:

- `ALLOWED_SERVICES` in `Code.gs` filters the services array, and anything that
  is not an exact match is **dropped silently**. The four labels in
  `frontend/src/features/enquiry/options.ts` match it exactly today.
- Every optional field is accepted without complaint, so a wrong name does not
  produce an error. It writes a blank cell instead. A submission that looks
  successful but arrives with an empty Project overview means the mapping drifted.

## Secrets

```bash
cd frontend
npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_URL
npx wrangler secret put SHEETS_SHARED_SECRET
npx wrangler secret put TURNSTILE_SECRET_KEY
```

The script refuses any request whose `secret` does not match the `SHARED_SECRET`
script property (Apps Script → Project Settings → Script Properties), so knowing
the web app URL is not enough to write to the sheet.

For `npx wrangler dev` the same three live in `frontend/.dev.vars`, which is
gitignored; see `.dev.vars.example`. The only Turnstile value the browser needs
is `VITE_TURNSTILE_SITE_KEY`, which is public by design and belongs in
Cloudflare's **build** variables, not in a Worker secret.

## Turnstile keys, local versus production

A real sitekey only renders on the hostnames allowed for that widget, so
pointing it at `localhost` gives visitors a verification failure page from
challenges.cloudflare.com. Cloudflare recommends leaving local hostnames off a
production widget, so use its dummy keys locally:

| | Local | Production |
|---|---|---|
| `VITE_TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` in `frontend/.env` | real key, as a Cloudflare build variable |
| `TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000AA` in `frontend/.dev.vars` | real key, via `wrangler secret put` |

The dummy secret accepts any token, so the Worker refuses to use one unless the
request really is for `localhost`, and answers 500 otherwise. Keep the real
sitekey out of `frontend/.env` so a build run on your own machine cannot ship a
key that accepts anything.

## Rate limiting

`Code.gs` limits 5 per IP per hour, 3 per email per hour and 200 per day, using
`CacheService` so the counts expire on their own. It only ever sees the Worker,
which is why the Worker forwards the visitor's address as `ip`; in production
that comes from `CF-Connecting-IP`, which Cloudflare sets and a client cannot
forge.

When a limit is hit the script returns `Too many submissions.`, and the Worker
turns that into a 429 so the visitor is asked to wait rather than shown a server
error.

## Changing the script

Editing `Code.gs` in the Apps Script editor is not enough on its own. Use
**Deploy → Manage deployments → (pencil) → Version: New version** so the
existing URL serves the edit. Creating a *new* deployment gives a different URL,
and the Worker keeps calling the old one.

Paste this folder's copy over the editor, so the two stay identical.

## Privacy

Google processes enquiry data under this setup, so it belongs in the service
providers listed in section 5 of `frontend/src/content/legal.ts`.
