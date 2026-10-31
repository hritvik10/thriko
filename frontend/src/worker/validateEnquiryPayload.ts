/**
 * Server-side validation for a submitted enquiry.
 *
 * Mirrors backend/app/schemas.py, and deliberately reuses the country list,
 * the option lists and the field limits the browser already validates against,
 * so the two cannot drift apart.
 */
import { projectTypeOptions, timelineOptions, type ProjectType, type Timeline } from '../features/enquiry/options';
import { findMarket, MAX_BUDGET, OTHER_MARKET } from '../features/enquiry/markets';
import { LIMITS } from '../features/enquiry/validation';

/** FastAPI's error shape, which the website already knows how to display. */
export interface ValidationIssue {
  loc: [string, string];
  msg: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PROJECT_TYPES = new Set<string>(projectTypeOptions.map((option) => option.value));
const TIMELINES = new Set<string>(timelineOptions.map((option) => option.value));

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateEnquiryPayload(input: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fail = (field: string, msg: string) => issues.push({ loc: ['body', field], msg });
  const body = (input ?? {}) as Record<string, unknown>;

  const name = text(body.name);
  if (name.length < LIMITS.nameMin) fail('name', 'Please enter your full name.');
  else if (name.length > LIMITS.nameMax) fail('name', `Name must be ${LIMITS.nameMax} characters or fewer.`);

  const email = text(body.email);
  if (!email || email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(email)) {
    fail('email', 'Enter a valid email address.');
  }

  const types = Array.isArray(body.project_types) ? (body.project_types as unknown[]) : [];
  const unique = [...new Set(types)];
  if (!unique.length || !unique.every((type): type is ProjectType => typeof type === 'string' && PROJECT_TYPES.has(type))) {
    fail('project_types', 'Choose at least one option.');
  }

  const country = text(body.country);
  if (!findMarket(country)) {
    fail('country', 'Select your country from the list.');
  } else if (country === OTHER_MARKET) {
    const other = text(body.other_country);
    if (other.length < 2) fail('other_country', 'Tell us which country you are in.');
    else if (other.length > LIMITS.countryMax) fail('other_country', 'That country name is too long.');
  }

  if (body.budget_not_sure !== true) {
    const budget = body.budget_amount;
    if (typeof budget !== 'number' || !Number.isInteger(budget)) {
      fail('budget_amount', 'Enter your approximate budget, or tick "Not sure yet".');
    } else if (budget < 1 || budget > MAX_BUDGET) {
      fail('budget_amount', 'Enter a realistic budget amount.');
    }
  }

  const timeline = text(body.timeline);
  if (!TIMELINES.has(timeline as Timeline)) fail('timeline', 'Choose a timeline.');

  if (text(body.message).length > LIMITS.messageMax) {
    fail('message', `Message must be ${LIMITS.messageMax} characters or fewer.`);
  }

  if (body.consent !== true) {
    fail('consent', 'Please confirm we may contact you about this enquiry.');
  }

  return issues;
}
