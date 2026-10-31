import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { config } from '../../config';
import { routes } from '../../routes';
import { EnquiryApiError, submitEnquiry } from './api';
import { budgetHints } from '../../content/site';
import { currencySymbol, findMarket, markets, OTHER_MARKET, parseAmount, type Market } from './markets';
import { projectTypeOptions, timelineOptions, type ProjectType } from './options';
import Turnstile from './Turnstile';
import { emptyEnquiry, type EnquiryField, type EnquiryFormValues, type FieldErrors } from './types';
import { firstInvalidField, LIMITS, toPayload, validateEnquiry } from './validation';
import styles from './EnquiryForm.module.css';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** DOM id for each field, used for labels, error links and focusing. */
const fieldId = (field: EnquiryField) => `enquiry-${field}`;
const errorId = (field: EnquiryField) => `enquiry-${field}-error`;
const BUDGET_HINT_ID = 'enquiry-budget-hint';

/** Element to focus for a field (checkbox groups focus their first option). */
function focusField(field: EnquiryField) {
  const id = field === 'projectTypes' ? `${fieldId(field)}-${projectTypeOptions[0].value}` : fieldId(field);
  document.getElementById(id)?.focus();
}

/**
 * Helper text under the budget field. Low or uncertain budgets get the
 * highlighted "affordable prices guaranteed" reassurance.
 */
function getBudgetHint(market: Market | undefined, values: EnquiryFormValues): { text: string; highlight: boolean } {
  if (!market) return { text: budgetHints.noCountry, highlight: false };
  if (values.budgetNotSure) return { text: budgetHints.notSure, highlight: true };

  const amount = parseAmount(values.budgetAmount);
  if (amount !== null && amount > 0 && amount < market.lowBudgetBelow) {
    return { text: budgetHints.lowBudget, highlight: true };
  }
  return { text: budgetHints.default, highlight: false };
}

interface EnquiryFormProps {
  /** Pre-tick the Founding Partner checkbox (e.g. when arriving from that section). */
  defaultPartnerProgram?: boolean;
}

export default function EnquiryForm({ defaultPartnerProgram = false }: EnquiryFormProps) {
  const [values, setValues] = useState<EnquiryFormValues>({ ...emptyEnquiry, partnerProgram: defaultPartnerProgram });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [turnstileToken, setTurnstileToken] = useState('');
  // Captured once on mount: a form completed in under a few seconds is a bot.
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  function update<K extends keyof EnquiryFormValues>(field: K, value: EnquiryFormValues[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    // After the first submit attempt, re-validate live so errors clear as they are fixed.
    if (submitAttempted) setErrors(validateEnquiry(next));
  }

  /** Add or remove a project type, keeping the on-screen order. */
  function toggleProjectType(value: ProjectType) {
    const selected = values.projectTypes.includes(value)
      ? values.projectTypes.filter((item) => item !== value)
      : projectTypeOptions.map((option) => option.value).filter((item) => item === value || values.projectTypes.includes(item));
    update('projectTypes', selected);
  }

  const onText =(field: 'name' | 'email' | 'message' | 'website') => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    update(field, event.target.value);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;
    setSubmitAttempted(true);

    const validationErrors = validateEnquiry(values);
    setErrors(validationErrors);
    const firstError = firstInvalidField(validationErrors);
    if (firstError) {
      setStatus('error');
      setStatusMessage('Some fields need your attention.');
      focusField(firstError);
      return;
    }

    setStatus('submitting');
    setStatusMessage('');
    try {
      await submitEnquiry(toPayload(values, { turnstileToken, startedAt }));
      setStatus('success');
    } catch (error) {
      const apiError =
        error instanceof EnquiryApiError ? error : new EnquiryApiError('Something went wrong. Please try again.', null);
      if (import.meta.env.DEV) console.error('[EnquiryForm] submission failed', error);
      setErrors(apiError.fieldErrors);
      setStatus('error');
      setStatusMessage(apiError.message);
      const firstServerError = firstInvalidField(apiError.fieldErrors);
      if (firstServerError) focusField(firstServerError);
    }
  }

  if (status === 'success') {
    return (
      <div ref={successRef} tabIndex={-1} className={styles.success} role="status">
        <div className={styles.successIcon}>
          <Icon name="check" size={30} strokeWidth={3} />
        </div>
        <h2>Thank you. Your request is in.</h2>
        <p>A senior team member will contact you within one business day to arrange a discovery call.</p>
        <Link to={routes.home} className={styles.backLink}>
          Return to homepage
        </Link>
      </div>
    );
  }

  /** Props shared by every input for accessible error reporting. */
  const a11y = (field: EnquiryField) => ({
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? errorId(field) : undefined,
  });

  const turnstileEnabled = Boolean(config.turnstileSiteKey);
  // While Turnstile is enabled, hold the button until the check has passed.
  const submitDisabled = status === 'submitting' || (turnstileEnabled && !turnstileToken);

  const selectedMarket = findMarket(values.country);
  const budgetDisabled = !selectedMarket || values.budgetNotSure;
  const budgetHint = getBudgetHint(selectedMarket, values);

  /** Tidy the typed amount into local formatting once the visitor leaves the field. */
  function formatBudgetOnBlur() {
    const amount = parseAmount(values.budgetAmount);
    if (selectedMarket && amount !== null) {
      update('budgetAmount', new Intl.NumberFormat(selectedMarket.locale).format(amount));
    }
  }

  const renderError = (field: EnquiryField) =>
    errors[field] ? (
      <p id={errorId(field)} className={styles.error}>
        <Icon name="alert" size={14} />
        {errors[field]}
      </p>
    ) : null;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Quote request">
      <p className={styles.formNote}>All fields are required unless marked optional.</p>

      <section className={styles.section} aria-labelledby="enquiry-section-about">
        <h2 id="enquiry-section-about" className={styles.sectionTitle}>
          About you
        </h2>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor={fieldId('name')}>Full name</label>
            <input
              id={fieldId('name')}
              className={styles.input}
              type="text"
              name="name"
              autoComplete="name"
              maxLength={LIMITS.nameMax}
              value={values.name}
              onChange={onText('name')}
              {...a11y('name')}
            />
            {renderError('name')}
          </div>

          <div className={styles.field}>
            <label htmlFor={fieldId('email')}>Business email</label>
            <input
              id={fieldId('email')}
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@company.com"
              maxLength={LIMITS.emailMax}
              value={values.email}
              onChange={onText('email')}
              {...a11y('email')}
            />
            {renderError('email')}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="enquiry-section-project">
        <h2 id="enquiry-section-project" className={styles.sectionTitle}>
          Your project
        </h2>

        <fieldset className={styles.field} aria-describedby={errors.projectTypes ? errorId('projectTypes') : undefined}>
          <legend>
            What do you need? <span className={styles.labelNote}>Choose all that apply</span>
          </legend>
          <div className={styles.choices}>
            {projectTypeOptions.map((option) => (
              <label key={option.value} className={styles.choice}>
                <input
                  id={`${fieldId('projectTypes')}-${option.value}`}
                  type="checkbox"
                  name="projectTypes"
                  value={option.value}
                  checked={values.projectTypes.includes(option.value)}
                  onChange={() => toggleProjectType(option.value)}
                  aria-invalid={Boolean(errors.projectTypes)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {renderError('projectTypes')}
        </fieldset>

        <div className={styles.field}>
          <label htmlFor={fieldId('message')}>
            Project overview <span className={styles.optional}>Optional</span>
          </label>
          <textarea
            id={fieldId('message')}
            className={`${styles.input} ${styles.textarea}`}
            name="message"
            placeholder="Business goals, key features, systems we should integrate with, and any important dates."
            maxLength={LIMITS.messageMax}
            value={values.message}
            onChange={onText('message')}
            {...a11y('message')}
          />
          <p className={styles.counter} aria-live="polite">
            {values.message.length} / {LIMITS.messageMax}
          </p>
          {renderError('message')}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="enquiry-section-scope">
        <h2 id="enquiry-section-scope" className={styles.sectionTitle}>
          Budget and timing
        </h2>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor={fieldId('country')}>Your country</label>
            <select
              id={fieldId('country')}
              className={`${styles.input} ${styles.select}`}
              name="country"
              autoComplete="country"
              value={values.country}
              onChange={(event) => update('country', event.target.value)}
              {...a11y('country')}
            >
              <option value="">Select your country</option>
              {markets.map((market) => (
                <option key={market.code} value={market.code}>
                  {market.name}
                </option>
              ))}
            </select>
            {renderError('country')}

            {values.country === OTHER_MARKET && (
              <div className={styles.subField}>
                <label htmlFor={fieldId('otherCountry')}>Which country?</label>
                <input
                  id={fieldId('otherCountry')}
                  className={styles.input}
                  type="text"
                  name="otherCountry"
                  autoComplete="country-name"
                  maxLength={LIMITS.countryMax}
                  value={values.otherCountry}
                  onChange={(event) => update('otherCountry', event.target.value)}
                  {...a11y('otherCountry')}
                />
                {renderError('otherCountry')}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor={fieldId('timeline')}>Desired timeline</label>
            <select
              id={fieldId('timeline')}
              className={`${styles.input} ${styles.select}`}
              name="timeline"
              value={values.timeline}
              onChange={(event) => update('timeline', event.target.value as EnquiryFormValues['timeline'])}
              {...a11y('timeline')}
            >
              <option value="">Please select</option>
              {timelineOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {renderError('timeline')}
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor={fieldId('budgetAmount')}>
              Your budget{selectedMarket && <span className={styles.labelNote}> ({selectedMarket.currency})</span>}
            </label>
            <div className={styles.amountRow}>
              <div className={[styles.amount, budgetDisabled && styles.amountDisabled].filter(Boolean).join(' ')}>
                {/* The symbol only appears once a country is chosen, so there is no placeholder glyph. */}
                {selectedMarket && (
                  <span className={styles.currency} aria-hidden="true">
                    {currencySymbol(selectedMarket)}
                  </span>
                )}
                <input
                  id={fieldId('budgetAmount')}
                  className={[styles.input, selectedMarket && styles.amountInput].filter(Boolean).join(' ')}
                  type="text"
                  inputMode="numeric"
                  name="budgetAmount"
                  autoComplete="off"
                  placeholder={selectedMarket ? 'e.g. 12,500' : 'Select your country first'}
                  maxLength={LIMITS.budgetInputMax}
                  disabled={budgetDisabled}
                  value={values.budgetNotSure ? '' : values.budgetAmount}
                  onChange={(event) => update('budgetAmount', event.target.value)}
                  onBlur={formatBudgetOnBlur}
                  aria-invalid={Boolean(errors.budgetAmount)}
                  aria-describedby={[BUDGET_HINT_ID, errors.budgetAmount && errorId('budgetAmount')].filter(Boolean).join(' ')}
                />
              </div>
              <label className={`${styles.check} ${styles.compactCheck}`}>
                <input
                  id={fieldId('budgetNotSure')}
                  type="checkbox"
                  name="budgetNotSure"
                  checked={values.budgetNotSure}
                  disabled={!selectedMarket}
                  onChange={(event) => update('budgetNotSure', event.target.checked)}
                />
                <span>Not sure yet</span>
              </label>
            </div>
            {renderError('budgetAmount')}
            <p id={BUDGET_HINT_ID} className={budgetHint.highlight ? styles.hintHighlight : styles.hint} aria-live="polite">
              {budgetHint.highlight && <Icon name="shield" size={16} />}
              {budgetHint.text}
            </p>
          </div>
        </div>
      </section>

      <div className={styles.agreements}>
        <label className={styles.check}>
          <input
            id={fieldId('partnerProgram')}
            type="checkbox"
            name="partnerProgram"
            checked={values.partnerProgram}
            onChange={(event) => update('partnerProgram', event.target.checked)}
          />
          <span>I'm interested in the Founding Partner Program.</span>
        </label>
        <label className={styles.check}>
          <input
            id={fieldId('consent')}
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={(event) => update('consent', event.target.checked)}
            {...a11y('consent')}
          />
          <span>I agree that Thriko may store these details to respond to my enquiry.</span>
        </label>
        {renderError('consent')}
      </div>

      {/* Honeypot: visually hidden and skipped by keyboard and screen readers. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onText('website')} />
      </div>

      <div className={styles.footer}>
        <div className={styles.submitRow}>
          {turnstileEnabled && (
            <Turnstile siteKey={config.turnstileSiteKey} onToken={setTurnstileToken} className={styles.turnstile} />
          )}
          <Button type="submit" className={styles.submit} disabled={submitDisabled} withArrow={status !== 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Submit request'}
          </Button>
        </div>
        <p className={styles.privacy}>
          <Icon name="lock" size={16} />
          <span>
            Your information is confidential and never shared. Read our{' '}
            <Link to={routes.privacy}>Privacy Policy</Link>.
          </span>
        </p>
      </div>

      <div role="alert" className={styles.formStatus}>
        {status === 'error' && statusMessage && (
          <>
            {statusMessage}{' '}
            {!Object.keys(errors).length && (
              <>
                You can also email <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>.
              </>
            )}
          </>
        )}
      </div>
    </form>
  );
}
