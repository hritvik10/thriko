import type { ProjectType, Timeline } from './options';

/** Form state as the user edits it (empty string = not chosen yet). */
export interface EnquiryFormValues {
  name: string;
  email: string;
  projectTypes: ProjectType[];
  /** Market code from shared/markets.json, e.g. "GB". */
  country: string;
  /** Free-text country name, only used when country is "OTHER". */
  otherCountry: string;
  /** Budget exactly as typed (formatted on blur); parsed with parseAmount(). */
  budgetAmount: string;
  budgetNotSure: boolean;
  timeline: Timeline | '';
  message: string;
  partnerProgram: boolean;
  consent: boolean;
  /** Honeypot: hidden from people, bots tend to fill it. Must stay empty. */
  website: string;
}

export type EnquiryField = Exclude<keyof EnquiryFormValues, 'website'>;

export type FieldErrors = Partial<Record<EnquiryField, string>>;

/** Request body sent to POST /api/enquiries (snake_case to match the Python API). */
export interface EnquiryPayload {
  name: string;
  email: string;
  project_types: ProjectType[];
  country: string;
  other_country: string;
  /** Whole units of the country's currency; null when the visitor is not sure. */
  budget_amount: number | null;
  budget_not_sure: boolean;
  timeline: Timeline;
  message: string;
  partner_program: boolean;
  consent: true;
  website: string;
}

export interface EnquiryResponse {
  id: string;
  message: string;
}

export const emptyEnquiry: EnquiryFormValues = {
  name: '',
  email: '',
  projectTypes: [],
  country: '',
  otherCountry: '',
  budgetAmount: '',
  budgetNotSure: false,
  timeline: '',
  message: '',
  partnerProgram: false,
  consent: false,
  website: '',
};
