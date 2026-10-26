import Button from '../../components/ui/Button';
import Container from '../../components/ui/Container';
import Icon from '../../components/ui/Icon';
import { hero, principles } from '../../content/site';
import { routes, sectionHref, sectionIds } from '../../routes';
import BlueprintCard from './BlueprintCard';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <Container className={styles.grid}>
          <div>
            <span className={styles.badge}>
              <Icon name="check" size={16} strokeWidth={2.5} />
              {hero.badge}
            </span>
            <h1 id="hero-title" className={styles.title}>
              {hero.titleStart} <em>{hero.titleHighlight}</em>
            </h1>
            <p className={styles.lead}>{hero.lead}</p>
            <div className={styles.ctas}>
              <Button to={routes.contact} withArrow>
                {hero.primaryCta}
              </Button>
              <Button to={sectionHref(sectionIds.work)} variant="outline">
                {hero.secondaryCta}
              </Button>
            </div>
            <ul className={styles.checks}>
              {hero.checks.map((item) => (
                <li key={item}>
                  <Icon name="check" size={18} strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <BlueprintCard />
        </Container>
      </section>

      {/* Replaces a client-logo strip: Thriko is new, so we lead with how we work. */}
      <section className={styles.principles} aria-label="How we work">
        <Container>
          <ul className={styles.principleList}>
            {principles.map((item) => (
              <li key={item}>
                <span className={styles.principleMark} aria-hidden="true">
                  {'}'}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
