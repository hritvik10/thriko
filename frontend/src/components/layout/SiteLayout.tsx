import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './SiteLayout.module.css';

/**
 * Shared page shell. Also handles scrolling on navigation: React Router does
 * not scroll to #hash targets by itself, so we do it here.
 */
export default function SiteLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section has rendered after a route change.
      const frame = requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0 });
    return undefined;
  }, [pathname, hash]);

  return (
    <>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );   
  
}
