import Container from '../../components/ui/Container';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { processSteps } from '../../content/site';
import { sectionIds } from '../../routes';
import styles from './Process.module.css';

export default function Process() {
  return (
    <section id={sectionIds.process} className={styles.section} aria-labelledby="process-title">
      <Container>
        <Reveal>
          <SectionHeading
            id="process-title"
            kicker="How we work"
            title="A proven four-stage delivery process"
            lead="Clear milestones and sign-offs at every stage, so you always know what you are paying for."
          />
        </Reveal>
        <ol className={styles.timeline}>
          {processSteps.map((step, index) => (
            <Reveal as="li" key={step.title} className={styles.step} delay={index * 90}>
              <span className={styles.number} aria-hidden="true">
                {index + 1}
              </span>
              <h3>
                <span className="visually-hidden">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p>{step.description}</p>
              <ul className={styles.outputs} aria-label="You receive">
                {step.outputs.map((output) => (
                  <li key={output}>{output}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
