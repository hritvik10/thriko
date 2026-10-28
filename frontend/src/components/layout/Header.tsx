import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../brand/Logo";
import Button from "../ui/Button";
import Container from "../ui/Container";
import Icon from "../ui/Icon";
import { routes } from "../../routes";
import { primaryNav } from "./navigation";
import styles from "./Header.module.css";

const DESKTOP_QUERY = "(min-width: 900px)";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const menuId = useId();

  // Close the mobile menu whenever the route or hash changes.
  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  // Add a shadow once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the mobile menu is open: lock page scroll, close on Escape or on resize to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setMenuOpen(false);
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onResize = () => desktop.matches && setMenuOpen(false);

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  return (
    <header
      className={[styles.header, scrolled && styles.scrolled]
        .filter(Boolean)
        .join(" ")}
    >
      <Container className={styles.bar}>
        <Link
          to={routes.home}
          className={styles.logoLink}
          aria-label="Thriko home"
        >
          <Logo height={30} withName />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          {primaryNav.map((item) => (
            <Link key={item.href} to={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Button to={routes.contact} size="sm" className={styles.quoteButton}>
            Get a Quote
          </Button>
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </Container>

      <nav
        id={menuId}
        className={styles.mobileNav}
        aria-label="Mobile"
        hidden={!menuOpen}
      >
        <Container>
          {primaryNav.map((item) => (
            <Link key={item.href} to={item.href} className={styles.mobileLink}>
              {item.label}
            </Link>
          ))}
          <Button to={routes.contact} className={styles.mobileCta}>
            Get a Quote
          </Button>
        </Container>
      </nav>
    </header>
  );
}
