import Button from '../../components/ui/Button';
import Container from '../../components/ui/Container';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { pricing } from '../../content/site';
import { routes, sectionIds } from '../../routes';
import styles from './Pricing.module.css';

/** Pricing intro plus a single quote CTA — no public price tiers. */
export default function Pricing() {
  return (
    <section id={sectionIds.pricing} className={styles.section} aria-labelledby="pricing-title">
      <Container>
        <Reveal>
          <SectionHeading id="pricing-title" kicker={pricing.kicker} title={pricing.title} lead={pricing.lead} align="center" />
        </Reveal>

        <Reveal className={styles.actions}>
          <Button to={routes.contact} withArrow>
            {pricing.cta}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
