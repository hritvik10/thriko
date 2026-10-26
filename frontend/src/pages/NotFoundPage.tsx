import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { routes } from '../routes';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <Container>
      <div style={{ padding: '120px 0', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <p style={{ font: '500 1rem/1 var(--font-mono)', color: 'var(--color-primary)' }}>{'{ 404 }'}</p>
        <h1 style={{ fontSize: '2.5rem', margin: '16px 0 12px' }}>We couldn't find that page</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: 32 }}>
          The link may be broken, or the page may have moved.
        </p>
        <Button to={routes.home}>Back to homepage</Button>
      </div>
    </Container>
  );
}
