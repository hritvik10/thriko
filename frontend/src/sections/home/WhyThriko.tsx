import Container from '../../components/ui/Container';
import Icon from '../../components/ui/Icon';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { whyThriko } from '../../content/site';
import { sectionIds } from '../../routes';
import styles from './WhyThriko.module.css';

export default function WhyThriko() {
  return (
    <section id={sectionIds.about} className={styles.section} aria-labelledby="why-title">
      <Container className={styles.layout}>
        <div>
          <Reveal>
            <SectionHeading id="why-title" kicker="Why Thriko" title={whyThriko.title} lead={whyThriko.lead} />
          </Reveal>
          <div className={styles.list}>
            {whyThriko.differentiators.map((item, index) => (
              <Reveal key={item.title} className={styles.item} delay={index * 70}>
                <div className={styles.icon}>
                  <Icon name={item.icon} size={22} />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className={styles.commitments}>
          <h3>Our commitments to you</h3>
          <dl>
            {whyThriko.commitments.map((commitment) => (
              <div key={commitment.label} className={styles.row}>
                <dt>{commitment.label}</dt>
                <dd>{commitment.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
