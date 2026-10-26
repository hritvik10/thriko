import Button from '../../components/ui/Button';
import Container from '../../components/ui/Container';
import Icon from '../../components/ui/Icon';
import Reveal from '../../components/ui/Reveal';
import { foundingPartner } from '../../content/site';
import { routes } from '../../routes';
import styles from './FoundingPartner.module.css';

/**
 * Replaces a testimonials section while Thriko has no clients yet:
 * turns being new into an offer for the first clients.
 */
export default function FoundingPartner() {
  return (
    <section className={styles.section} aria-labelledby="partner-title">
      <Container>
        <Reveal className={styles.panel}>
          <div className={styles.intro}>
            <span className={styles.tag}>
              <Icon name="star" size={14} strokeWidth={2.5} />
              {foundingPartner.tag}
            </span>
            <h2 id="partner-title">{foundingPartner.title}</h2>
            <p>{foundingPartner.lead}</p>
            <Button to={`${routes.contact}?partner=founding`} withArrow>
              {foundingPartner.cta}
            </Button>
            <p className={styles.note}>{foundingPartner.note}</p>
          </div>
          <ul className={styles.benefits}>
            {foundingPartner.benefits.map((benefit) => (
              <li key={benefit.title}>
                <span className={styles.icon}>
                  <Icon name={benefit.icon} size={20} />
                </span>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
