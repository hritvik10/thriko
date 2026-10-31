# Reference only — not used by this project

These two files came with the Apps Script in the parent folder. They are
**Next.js**, and this project is Vite plus a Cloudflare Worker, so nothing here
runs. They are kept because they are the written record of the contract
`Code.gs` expects.

- `route.ts` — the Next.js API route the script was written against. Its field
  names are the authoritative list: `fullName`, `services`, `budget`,
  `currency`, `budgetNotSure`, `timeline`, `overview`, `foundingPartner`,
  `company_website`, `ip`, `pageUrl`.
- `submitEnquiry.ts` — the browser-side caller for that route.

The equivalent in this project is `frontend/src/worker/index.ts`, and
`toSheetsPayload()` there translates the form's own field names into the ones
above. If `Code.gs` ever changes, update that function and these notes together.
