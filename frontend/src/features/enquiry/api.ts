import { config } from '../../config';
import type { EnquiryField, EnquiryPayload, EnquiryResponse, FieldErrors } from './types';

/** Error with a user-friendly message plus any field errors returned by the server. */
export class EnquiryApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = 'EnquiryApiError';
  }
}

/** Maps API (snake_case) field names back to form field names. */
const API_TO_FORM_FIELD: Record<string, EnquiryField> = {
  name: 'name',
  email: 'email',
  project_types: 'projectTypes',
  country: 'country',
  other_country: 'otherCountry',
  budget_amount: 'budgetAmount',
  budget_not_sure: 'budgetNotSure',
  timeline: 'timeline',
  message: 'message',
  partner_program: 'partnerProgram',
  consent: 'consent',
};

interface FastApiValidationItem {
  loc?: (string | number)[];
  msg?: string;
}

function parseFieldErrors(body: unknown): FieldErrors {
  const detail = (body as { detail?: unknown })?.detail;
  if (!Array.isArray(detail)) return {};

  const errors: FieldErrors = {};
  for (const item of detail as FastApiValidationItem[]) {
    // loc looks like ["body", "email"], or ["body", "project_types", 0] for list items:
    // use the last string segment as the field name.
    const apiField = [...(item.loc ?? [])].reverse().find((part): part is string => typeof part === 'string');
    const field = apiField ? API_TO_FORM_FIELD[apiField] : undefined;
    if (field && !errors[field]) errors[field] = item.msg ?? 'Please check this field.';
  }
  return errors;
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), config.requestTimeoutMs);

  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'AbortError';
    throw new EnquiryApiError(
      timedOut
        ? 'The request timed out. Please check your connection and try again.'
        : 'We could not reach our server. Please try again, or email us directly.',
      null,
    );
  } finally {
    window.clearTimeout(timeout);
  }

  const body: unknown = await response.json().catch(() => null);
  const status = response.status;

  if (status === 200 || status === 201) return body as EnquiryResponse;

  if (status === 422) {
    throw new EnquiryApiError('Some fields need your attention.', 422, parseFieldErrors(body));
  }
  if (status === 429) {
    throw new EnquiryApiError('Too many requests. Please wait a minute and try again.', 429);
  }
  throw new EnquiryApiError('Something went wrong on our side. Please try again, or email us directly.', status);
}
