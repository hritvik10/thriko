import Container from '../../components/ui/Container';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { exampleBuilds, type ExampleBuild } from '../../content/site';
import { sectionIds } from '../../routes';
import styles from './ExampleBuilds.module.css';

/** Simple CSS mockups so each blueprint card has a visual without stock images. */
function BuildVisual({ kind }: { kind: ExampleBuild['visual'] }) {
  switch (kind) {
    case 'phone':
      return (
        <div className={styles.phone}>
          <i className={styles.block} />
          <i />
          <i style={{ width: '70%' }} />
          <i className={styles.pill} />
        </div>
      );
    case 'chat':
      return (
        <div className={styles.chat}>
          <span className={styles.bubbleIn} />
          <span className={styles.bubbleOut} />
          <span className={styles.bubbleIn} style={{ width: '55%' }} />
        </div>
      );
    case 'storefront':
      return (
        <div className={styles.screen}>
          <div className={styles.tiles}>
            <i />
            <i />
            <i />
          </div>
          <i style={{ width: '60%' }} />
        </div>
      );
    case 'dashboard':
    default:
      return (
        <div className={styles.screen}>
          <div className={styles.bars}>
            {[40, 65, 50, 80, 70, 92].map((height) => (
              <i key={height} style={{ height: `${height}%` }} />
            ))}
          </div>
          <i style={{ width: '75%' }} />
        </div>
      );
  }
}

export default function ExampleBuilds() {
  return (
    <section id={sectionIds.work} className={styles.section} aria-labelledby="work-title">
      <Container>
        <Reveal>
          <SectionHeading id="work-title" kicker="What we build" title={exampleBuilds.title} lead={exampleBuilds.lead} />
        </Reveal>
        <div className={styles.grid}>
          {exampleBuilds.items.map((build, index) => (
            <Reveal as="article" key={build.title} className={styles.card} delay={index * 80}>
              <div className={styles.visual} aria-hidden="true">
                <BuildVisual kind={build.visual} />
              </div>
              <div className={styles.body}>
                <span className={styles.category}>{build.category}</span>
                <h3>{build.title}</h3>
                <p>{build.description}</p>
                <ul className={styles.features} aria-label="Key features">
                  {build.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <p className={styles.stack}>
                  <span className="visually-hidden">Typical stack: </span>
                  {build.stack.join(' · ')}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
