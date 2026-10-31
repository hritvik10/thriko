import { describe, expect, it } from 'vitest';
import { validateEnquiryPayload } from './validateEnquiryPayload';

const VALID = {
  name: 'Jane Cooper',
  email: 'jane@company.com',
  project_types: ['website', 'ai'],
  country: 'GB',
  other_country: '',
  budget_amount: 25_000,
  budget_not_sure: false,
  timeline: '1_3_months',
  message: 'We want an AI assistant.',
  partner_program: true,
  consent: true,
  website: '',
};

const fields = (payload: unknown) => validateEnquiryPayload(payload).map((issue) => issue.loc[1]);

describe('validateEnquiryPayload', () => {
  it('accepts a complete enquiry', () => {
    expect(validateEnquiryPayload(VALID)).toEqual([]);
  });

  it('rejects a short name', () => expect(fields({ ...VALID, name: 'J' })).toEqual(['name']));
  it('rejects a malformed email', () => expect(fields({ ...VALID, email: 'nope' })).toEqual(['email']));
  it('rejects no project type', () => expect(fields({ ...VALID, project_types: [] })).toEqual(['project_types']));
  it('rejects an unknown project type', () =>
    expect(fields({ ...VALID, project_types: ['crypto'] })).toEqual(['project_types']));
  it('rejects an unknown country', () => expect(fields({ ...VALID, country: 'ZZ' })).toEqual(['country']));
  it('rejects a bad timeline', () => expect(fields({ ...VALID, timeline: 'someday' })).toEqual(['timeline']));
  it('rejects a missing budget', () => expect(fields({ ...VALID, budget_amount: null })).toEqual(['budget_amount']));
  it('rejects a fractional budget', () => expect(fields({ ...VALID, budget_amount: 10.5 })).toEqual(['budget_amount']));
  it('rejects an over-long message', () =>
    expect(fields({ ...VALID, message: 'x'.repeat(2001) })).toEqual(['message']));
  it('rejects a missing consent', () => expect(fields({ ...VALID, consent: false })).toEqual(['consent']));

  it('accepts "not sure" instead of an amount', () => {
    expect(validateEnquiryPayload({ ...VALID, budget_amount: null, budget_not_sure: true })).toEqual([]);
  });

  it('requires a country name when the country is OTHER', () => {
    expect(fields({ ...VALID, country: 'OTHER', other_country: '' })).toEqual(['other_country']);
    expect(validateEnquiryPayload({ ...VALID, country: 'OTHER', other_country: 'Kenya' })).toEqual([]);
  });

  it('reports every problem at once, in FastAPI shape', () => {
    const issues = validateEnquiryPayload({ ...VALID, name: '', email: 'x', consent: false });
    expect(issues.map((issue) => issue.loc[1]).sort()).toEqual(['consent', 'email', 'name']);
    expect(issues[0]?.loc[0]).toBe('body');
  });

  it('does not throw on junk input', () => {
    expect(() => validateEnquiryPayload(null)).not.toThrow();
    expect(() => validateEnquiryPayload('nonsense')).not.toThrow();
    expect(validateEnquiryPayload({}).length).toBeGreaterThan(0);
  });
});
