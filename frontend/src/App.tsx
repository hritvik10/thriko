import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout';
import HomePage from './pages/HomePage';
import { routes } from './routes';

// The home page ships in the main bundle; other pages load on demand.
const loadContactPage = () => import('./pages/ContactPage');
const ContactPage = lazy(loadContactPage);
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Fetch the contact page in the background once the browser is idle, so "Get a Quote" opens instantly. */
function usePrefetchContactPage() {
  useEffect(() => {
    const prefetch = () => void loadContactPage();
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    // Safari has no requestIdleCallback.
    const id = setTimeout(prefetch, 2500);
    return () => clearTimeout(id);
  }, []);
}

export default function App() {
  usePrefetchContactPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} aria-busy="true" />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.contact} element={<ContactPage />} />
          <Route path={routes.privacy} element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
