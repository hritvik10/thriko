import Container from '../../components/ui/Container';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { faqs } from '../../content/site';
import { sectionIds } from '../../routes';
import styles from './Faq.module.css';

/** Uses native <details> so it is keyboard and screen-reader accessible with no JS. */
export default function Faq() {
  return (
    <section id={sectionIds.faq} className={styles.section} aria-labelledby="faq-title">
      <Container>
        <Reveal>
          <SectionHeading id="faq-title" kicker="FAQ" title="Questions we often hear" align="center" />
        </Reveal>
        <Reveal className={styles.list}>
          {faqs.map((faq) => (
            <details key={faq.question} className={styles.item}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
