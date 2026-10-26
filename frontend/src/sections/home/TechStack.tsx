import Container from '../../components/ui/Container';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { techStack } from '../../content/site';
import styles from './TechStack.module.css';

export default function TechStack() {
  return (
    <section className={styles.section} aria-labelledby="tech-title">
      <Container>
        <Reveal>
          <SectionHeading
            id="tech-title"
            kicker="Technology"
            title="Enterprise-grade, industry-standard technology"
            lead="We choose mature, well-supported tools, so any qualified team can maintain your product in future."
          />
        </Reveal>
        <Reveal className={styles.table}>
          {techStack.map((group) => (
            <div key={group.group} className={styles.group}>
              <h3>{group.group}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
