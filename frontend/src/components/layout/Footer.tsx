import { Link } from "react-router-dom";
import Logo from "../brand/Logo";
import Container from "../ui/Container";
import Icon, { type IconName } from "../ui/Icon";
import { config } from "../../config";
import { routes, sectionHref, sectionIds } from "../../routes";
import styles from "./Footer.module.css";

// TODO: replace with Thriko's real profile URLs before launch.
const socials: { label: string; href: string; icon: IconName }[] = [
  {
    label: "Thriko on LinkedIn",
    href: "https://www.linkedin.com/company/thriko/",
    icon: "linkedin",
  },
  {
    label: "Email Thriko",
    href: `mailto:${config.contactEmail}`,
    icon: "mail",
  },
];

const columns = [
  {
    title: "Services",
    links: [
      { label: "Website Development", to: sectionHref(sectionIds.services) },
      { label: "Mobile Apps", to: sectionHref(sectionIds.services) },
      { label: "UI/UX Design", to: sectionHref(sectionIds.services) },
      { label: "AI Studio", to: sectionHref(sectionIds.ai) },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "What we build", to: sectionHref(sectionIds.work) },
      { label: "Pricing", to: sectionHref(sectionIds.pricing) },
      { label: "Process", to: sectionHref(sectionIds.process) },
      { label: "About", to: sectionHref(sectionIds.about) },
      { label: "FAQ", to: sectionHref(sectionIds.faq) },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.about}>
            <Link to={routes.home} aria-label="Thriko home">
              <Logo height={30} withName />
            </Link>
            <p>
              Websites, mobile apps and AI software for businesses that can't
              afford to get it wrong.
            </p>
            <ul className={styles.socials}>
              {socials.map((social) => (
                <li key={social.href}>
                  {/* Web links open in a new tab; the mailto link should not. */}
                  <a
                    href={social.href}
                    aria-label={social.label}
                    {...(social.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <Icon name={social.icon} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className={styles.heading}>{column.title}</h2>
              <ul className={styles.links}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className={styles.heading}>Contact</h2>
            <ul className={styles.links}>
              <li>
                <a href={`mailto:${config.contactEmail}`}>
                  {config.contactEmail}
                </a>
              </li>
              <li>
                <Link to={routes.contact}>Request a quote</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {year} Thriko. All rights reserved.</span>
          {/* TODO: link real policy pages once they exist. */}
          <span>
            <Link to={routes.home}>Privacy Policy</Link> ·{" "}
            <Link to={routes.home}>Terms of Service</Link>
          </span>
        </div>
      </Container>
    </footer>
  );
}
