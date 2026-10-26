import { Link, useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Icon from '../components/ui/Icon';
import { config } from '../config';
import { contactPage } from '../content/site';
import EnquiryForm from '../features/enquiry/EnquiryForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { routes } from '../routes';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  useDocumentTitle('Request a Quote');
  const [searchParams] = useSearchParams();
  const fromPartnerProgram = searchParams.get('partner') === 'founding';

  return (
    <div className={styles.page}>
      <Container>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to={routes.home}>Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Request a quote</span>
        </nav>

        <header className={styles.intro}>
          <span className={styles.kicker}>{contactPage.kicker}</span>
          <h1>{contactPage.title}</h1>
          <p>{contactPage.lead}</p>
        </header>

        <div className={styles.layout}>
          <EnquiryForm defaultPartnerProgram={fromPartnerProgram} />

          <aside className={styles.aside} aria-label="Contact details">
            <section className={styles.card}>
              <h2>Contact us directly</h2>
              <div className={styles.row}>
                <span className={styles.icon}>
                  <Icon name="mail" />
                </span>
                <div>
                  <a href={`mailto:${config.contactEmail}`} className={styles.email}>
                    {config.contactEmail}
                  </a>
                  <span>New projects and partnerships</span>
                </div>
              </div>
              <div className={styles.row}>
                <span className={styles.icon}>
                  <Icon name="clock" />
                </span>
                <div>
                  <strong>Reply within 1 business day</strong>
                  <span>Monday to Friday, 9:00–18:00</span>
                </div>
              </div>
            </section>

            <section className={`${styles.card} ${styles.promise}`} aria-labelledby="affordability-title">
              <span className={styles.promiseIcon}>
                <Icon name="shield" size={22} />
              </span>
              <div>
                <h2 id="affordability-title">{contactPage.affordability.title}</h2>
                <p>{contactPage.affordability.body}</p>
              </div>
            </section>

            <section className={styles.card}>
              <h2>What happens after you submit</h2>
              <ol className={styles.steps}>
                {contactPage.nextSteps.map((step, index) => (
                  <li key={step.title}>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {index + 1}
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <span>{step.description}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className={`${styles.card} ${styles.navy}`} aria-label="Our assurances">
              <ul className={styles.assurances}>
                {contactPage.assurances.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={18} strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </Container>
    </div>
  );
}
