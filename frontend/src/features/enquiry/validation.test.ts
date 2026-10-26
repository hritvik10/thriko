import { describe, expect, it } from 'vitest';
import { findMarket, formatAmount, parseAmount } from './markets';
import { emptyEnquiry, type EnquiryFormValues } from './types';
import { firstInvalidField, toPayload, validateEnquiry } from './validation';

const valid: EnquiryFormValues = {
  ...emptyEnquiry,
  name: 'Jane Cooper',
  email: 'jane@company.com',
  projectTypes: ['website'],
  country: 'GB',
  budgetAmount: '12,500',
  timeline: 'flexible',
  consent: true,
};

describe('validateEnquiry', () => {
  it('accepts a complete enquiry', () => {
    expect(validateEnquiry(valid)).toEqual({});
  });

  it('flags every required field on an empty form', () => {
    const errors = validateEnquiry(emptyEnquiry);
    expect(Object.keys(errors).sort()).toEqual(['budgetAmount', 'consent', 'country', 'email', 'name', 'projectTypes', 'timeline']);
  });

  it('rejects a malformed email', () => {
    expect(validateEnquiry({ ...valid, email: 'jane@company' }).email).toBeDefined();
  });

  it('rejects an over-long message', () => {
    expect(validateEnquiry({ ...valid, message: 'x'.repeat(2001) }).message).toBeDefined();
  });

  it('requires a country name when "Other" is chosen', () => {
    expect(validateEnquiry({ ...valid, country: 'OTHER' }).otherCountry).toBeDefined();
    expect(validateEnquiry({ ...valid, country: 'OTHER', otherCountry: 'Japan' })).toEqual({});
  });

  it('rejects an unknown country code', () => {
    expect(validateEnquiry({ ...valid, country: 'XX' }).country).toBeDefined();
  });

  it('requires a budget unless "Not sure yet" is ticked', () => {
    expect(validateEnquiry({ ...valid, budgetAmount: '' }).budgetAmount).toBeDefined();
    expect(validateEnquiry({ ...valid, budgetAmount: '', budgetNotSure: true })).toEqual({});
  });

  it('rejects non-numeric, decimal, zero and huge budgets', () => {
    for (const input of ['abc', '12.50', '0', '99999999999']) {
      expect(validateEnquiry({ ...valid, budgetAmount: input }).budgetAmount, input).toBeDefined();
    }
  });

  it('returns the first invalid field in on-screen order', () => {
    expect(firstInvalidField(validateEnquiry({ ...valid, email: '', consent: false }))).toBe('email');
  });
});

describe('toPayload', () => {
  it('trims text, parses the budget and maps to snake_case', () => {
    const payload = toPayload({ ...valid, name: '  Jane Cooper  ', partnerProgram: true });
    expect(payload).toMatchObject({
      name: 'Jane Cooper',
      project_types: ['website'],
      country: 'GB',
      budget_amount: 12500,
      budget_not_sure: false,
      partner_program: true,
    });
  });

  it('sends a null amount when the visitor is not sure', () => {
    expect(toPayload({ ...valid, budgetAmount: '500', budgetNotSure: true }).budget_amount).toBeNull();
  });

  it('only sends other_country for the "Other" option', () => {
    expect(toPayload({ ...valid, otherCountry: 'Japan' }).other_country).toBe('');
    expect(toPayload({ ...valid, country: 'OTHER', otherCountry: ' Japan ' }).other_country).toBe('Japan');
  });

  it('throws on incomplete values', () => {
    expect(() => toPayload(emptyEnquiry)).toThrow();
  });
});

describe('markets', () => {
  it('parses common ways of typing an amount', () => {
    expect(parseAmount('12,500')).toBe(12500);
    expect(parseAmount('12.500')).toBe(12500);
    expect(parseAmount(' 12 500 ')).toBe(12500);
    expect(parseAmount('4,00,000')).toBe(400000);
    expect(parseAmount('12.50')).toBeNull();
    expect(parseAmount('£500')).toBeNull();
    expect(parseAmount('')).toBeNull();
  });

  it('formats amounts in the local currency', () => {
    expect(formatAmount(findMarket('GB')!, 12500)).toBe('£12,500');
    expect(formatAmount(findMarket('IN')!, 400000)).toBe('₹4,00,000');
  });
});
