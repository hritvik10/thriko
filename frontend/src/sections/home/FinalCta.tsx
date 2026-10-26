import Button from '../../components/ui/Button';
import Container from '../../components/ui/Container';
import Reveal from '../../components/ui/Reveal';
import { finalCta } from '../../content/site';
import { routes } from '../../routes';
import styles from './FinalCta.module.css';

export default function FinalCta() {
  return (
    <section aria-labelledby="cta-title">
      <Container>
        <Reveal className={styles.band}>
          <div>
            <h2 id="cta-title">{finalCta.title}</h2>
            <p>{finalCta.lead}</p>
          </div>
          <div className={styles.actions}>
            <Button to={routes.contact} variant="light" withArrow>
              {finalCta.primary}
            </Button>
            <Button to={routes.contact} variant="ghostLight">
              {finalCta.secondary}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
