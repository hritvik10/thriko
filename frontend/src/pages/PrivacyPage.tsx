import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Icon from '../components/ui/Icon';
import { config } from '../config';
import { privacyPolicy, type LegalBlock } from '../content/legal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { routes } from '../routes';
import styles from './LegalPage.module.css';

/** Replaces the `{contactEmail}` token in the policy copy with a real mailto link. */
function withContactEmail(text: string): ReactNode {
  const parts = text.split('{contactEmail}');
  if (parts.length === 1) {
    return text;
  }
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 && <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>}
    </span>
  ));
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === 'text') {
    return <p>{withContactEmail(block.text)}</p>;
  }

  if (block.type === 'list') {
    return (
      <ul className={styles.list}>
        {block.items.map((item) => (
          <li key={item}>
            <Icon name="check" size={16} strokeWidth={2.75} />
            <span>{withContactEmail(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className={styles.defs}>
      {block.items.map((item) => (
        <div key={item.term}>
          <dt>{item.term}</dt>
          <dd>{withContactEmail(item.detail)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PrivacyPage() {
  useDocumentTitle(privacyPolicy.title);

  return (
    <div className={styles.page}>
      <Container>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to={routes.home}>Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{privacyPolicy.title}</span>
        </nav>

        <header className={styles.intro}>
          <span className={styles.kicker}>{privacyPolicy.kicker}</span>
          <h1>{privacyPolicy.title}</h1>
          <p>{privacyPolicy.lead}</p>
          <p className={styles.dates}>
            <span>
              Effective <strong>{privacyPolicy.effectiveDate}</strong>
            </span>
            <span>
              Last updated <strong>{privacyPolicy.lastUpdated}</strong>
            </span>
          </p>
        </header>

        <section className={`${styles.card} ${styles.summary}`} aria-labelledby="privacy-summary-title">
          <span className={styles.summaryIcon}>
            <Icon name="lock" size={22} />
          </span>
          <div>
            <h2 id="privacy-summary-title">The short version</h2>
            <ul>
              {privacyPolicy.summary.map((item) => (
                <li key={item}>
                  <Icon name="check" size={16} strokeWidth={2.75} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className={styles.layout}>
          <nav className={`${styles.card} ${styles.toc}`} aria-labelledby="privacy-toc-title">
            <h2 id="privacy-toc-title">{privacyPolicy.tocTitle}</h2>
            <ol>
              {privacyPolicy.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.heading}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={`${styles.card} ${styles.body}`}>
            {privacyPolicy.sections.map((section) => (
              <section key={section.id} id={section.id} className={styles.section}>
                <h2>{section.heading}</h2>
                {section.blocks.map((block, index) => (
                  <Block key={index} block={block} />
                ))}
              </section>
            ))}

            <p className={styles.footnote}>
              Looking for how we handle confidential project information before you hire us? We are happy to sign a mutual
              non-disclosure agreement before our first call. Just ask when you{' '}
              <Link to={routes.contact}>request a quote</Link>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
