import { Link } from 'react-router-dom';
import Container from '../../components/ui/Container';
import Icon from '../../components/ui/Icon';
import Reveal from '../../components/ui/Reveal';
import SectionHeading from '../../components/ui/SectionHeading';
import { services } from '../../content/site';
import { routes, sectionIds } from '../../routes';
import styles from './Services.module.css';

export default function Services() {
  return (
    <section id={sectionIds.services} className={styles.section} aria-labelledby="services-title">
      <Container>
        <Reveal>
          <SectionHeading
            id="services-title"
            kicker="Our services"
            title="End-to-end delivery, from strategy to support"
            lead="One accountable partner for every stage of your digital product."
          />
        </Reveal>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <Reveal as="article" key={service.title} className={styles.card} delay={index * 80}>
              <div className={styles.icon}>
                <Icon name={service.icon} size={24} />
              </div>
              <h3>{service.title}</h3>
              <p className={styles.description}>{service.description}</p>
              <ul className={styles.deliverables}>
                {service.deliverables.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={14} strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to={routes.contact} className={styles.more}>
                {service.cta} <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
