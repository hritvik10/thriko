import Button from '../../components/ui/Button';
import Container from '../../components/ui/Container';
import Icon from '../../components/ui/Icon';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { aiSection } from '../../content/site';
import { routes, sectionIds } from '../../routes';
import styles from './AiStudio.module.css';

/** Premium section: LLM integrations, MCP servers, agentic workflows and AI software. */
export default function AiStudio() {
  return (
    <section id={sectionIds.ai} className={styles.section} aria-labelledby="ai-title">
      <Container>
        <Reveal>
          <SectionHeading id="ai-title" kicker={aiSection.tag} title={aiSection.title} lead={aiSection.lead} tone="onDark" />
        </Reveal>

        <div className={styles.grid}>
          {aiSection.capabilities.map((capability, index) => (
            <Reveal as="article" key={capability.title} className={styles.card} delay={index * 80}>
              <div className={styles.icon}>
                <Icon name={capability.icon} size={22} />
              </div>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <ul className={styles.examples}>
                {capability.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.lower}>
          <div className={styles.flowPanel}>
            <h3 className={styles.panelTitle}>How an AI workflow runs</h3>
            <ol className={styles.flow} aria-label="AI workflow steps">
              {aiSection.flow.map((step, index) => (
                <li key={step} className={step === 'Human approval' ? styles.flowHuman : undefined}>
                  <span className={styles.flowIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className={styles.safeguards}>
            <h3 className={styles.panelTitle}>Responsible by default</h3>
            <ul>
              {aiSection.safeguards.map((item) => (
                <li key={item}>
                  <Icon name="lock" size={16} />
                  {item}
                </li>
              ))}
            </ul>
            <Button to={routes.contact} variant="light" withArrow className={styles.cta}>
              {aiSection.cta}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
