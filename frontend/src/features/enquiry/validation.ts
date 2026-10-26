import { findMarket, formatAmount, MAX_BUDGET, OTHER_MARKET, parseAmount } from './markets';
import type { EnquiryField, EnquiryFormValues, EnquiryPayload, FieldErrors } from './types';

/** Limits mirror backend/app/schemas.py. */
export const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  countryMax: 60,
  budgetInputMax: 20,
  messageMax: 2000,
} as const;

// Deliberately simple: the server performs the authoritative email check.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Order in which fields appear on screen, used to focus the first error. */
export const FIELD_ORDER: EnquiryField[] = [
  'name',
  'email',
  'projectTypes',
  'country',
  'otherCountry',
  'budgetAmount',
  'budgetNotSure',
  'timeline',
  'message',
  'partnerProgram',
  'consent',
];

export function validateEnquiry(values: EnquiryFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const otherCountry = values.otherCountry.trim();
  const market = findMarket(values.country);

  if (name.length < LIMITS.nameMin) errors.name = 'Please enter your full name.';
  else if (name.length > LIMITS.nameMax) errors.name = `Name must be ${LIMITS.nameMax} characters or fewer.`;

  if (!email) errors.email = 'Please enter your email address.';
  else if (email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(email))
    errors.email = 'Enter a valid email, like name@company.com.';

  if (values.projectTypes.length === 0) errors.projectTypes = 'Select at least one project type.';

  if (!market) errors.country = 'Select your country.';
  else if (values.country === OTHER_MARKET && (otherCountry.length < 2 || otherCountry.length > LIMITS.countryMax))
    errors.otherCountry = 'Tell us which country you are in.';

  if (!values.budgetNotSure) {
    const amount = parseAmount(values.budgetAmount);
    if (!market) errors.budgetAmount = 'Select your country first, then enter your budget.';
    else if (!values.budgetAmount.trim()) errors.budgetAmount = 'Enter your approximate budget, or tick "Not sure yet".';
    else if (amount === null) errors.budgetAmount = `Enter a whole amount, like ${formatAmount(market, 12500)}.`;
    else if (amount < 1 || amount > MAX_BUDGET) errors.budgetAmount = 'Please enter a realistic budget.';
  }

  if (!values.timeline) errors.timeline = 'Select a timeline.';

  if (values.message.length > LIMITS.messageMax)
    errors.message = `Please keep your message under ${LIMITS.messageMax} characters.`;

  if (!values.consent) errors.consent = 'Please confirm we may contact you about this enquiry.';

  return errors;
}

export function firstInvalidField(errors: FieldErrors): EnquiryField | undefined {
  return FIELD_ORDER.find((field) => errors[field]);
}

/**
 * Convert validated form values into the API payload.
 * Throws if called with values that have not passed validation.
 */
export function toPayload(values: EnquiryFormValues): EnquiryPayload {
  const amount = values.budgetNotSure ? null : parseAmount(values.budgetAmount);
  if (values.projectTypes.length === 0 || !values.country || (!values.budgetNotSure && amount === null) || !values.timeline || !values.consent) {
    throw new Error('toPayload called with incomplete values; run validateEnquiry first.');
  }
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    project_types: values.projectTypes,
    country: values.country,
    other_country: values.country === OTHER_MARKET ? values.otherCountry.trim() : '',
    budget_amount: amount,
    budget_not_sure: values.budgetNotSure,
    timeline: values.timeline,
    message: values.message.trim(),
    partner_program: values.partnerProgram,
    consent: true,
    website: values.website,
  };
}
