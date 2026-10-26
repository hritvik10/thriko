/**
 * Allowed values for the enquiry form. These MUST match the values accepted by
 * the backend (backend/app/schemas.py) — the API rejects anything else.
 */
/** Multi-select: visitors can tick any combination. */
export const projectTypeOptions = [
  { value: 'website', label: 'Website' },
  { value: 'mobile_app', label: 'Mobile app' },
  { value: 'ui_ux', label: 'UI/UX design' },
  { value: 'ai', label: 'AI integration' },
] as const;

// Budget ranges depend on the visitor's country: see markets.ts and /shared/markets.json.

export const timelineOptions = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1_3_months', label: '1–3 months' },
  { value: '3_6_months', label: '3–6 months' },
  { value: 'flexible', label: 'Flexible' },
] as const;

export type ProjectType = (typeof projectTypeOptions)[number]['value'];
export type Timeline = (typeof timelineOptions)[number]['value'];
