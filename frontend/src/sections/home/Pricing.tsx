import Button from '../../components/ui/Button';
import Container from '../../components/ui/Container';
import Icon from '../../components/ui/Icon';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { pricing } from '../../content/site';
import { routes, sectionIds } from '../../routes';
import styles from './Pricing.module.css';

/** Price ranges from $1,000 to $50,000+ plus the affordability guarantee. */
export default function Pricing() {
  return (
    <section id={sectionIds.pricing} className={styles.section} aria-labelledby="pricing-title">
      <Container>
        <Reveal>
          <SectionHeading id="pricing-title" kicker={pricing.kicker} title={pricing.title} lead={pricing.lead} align="center" />
        </Reveal>

        <div className={styles.tiers}>
          {pricing.tiers.map((tier, index) => (
            <Reveal
              as="article"
              key={tier.name}
              delay={index * 80}
              className={[styles.tier, tier.highlighted && styles.highlighted].filter(Boolean).join(' ')}
            >
              <div className={styles.tierHead}>
                <h3>{tier.name}</h3>
                <span className={styles.note}>{tier.priceNote}</span>
              </div>
              <p className={styles.price}>{tier.price}</p>
              <p className={styles.description}>{tier.description}</p>
              <ul className={styles.features}>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <Icon name="check" size={16} strokeWidth={2.75} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button to={routes.contact} variant={tier.highlighted ? 'primary' : 'outline'} className={styles.cta}>
                {tier.cta}
              </Button>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.promise}>
          <span className={styles.promiseIcon}>
            <Icon name="shield" size={26} />
          </span>
          <div>
            <h3>{pricing.promise.title}</h3>
            <p>{pricing.promise.body}</p>
          </div>
        </Reveal>

        <p className={styles.footnote}>{pricing.footnote}</p>
      </Container>
    </section>
  );
}
