import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Hero from '../sections/home/Hero';
import Services from '../sections/home/Services';
import AiStudio from '../sections/home/AiStudio';
import ExampleBuilds from '../sections/home/ExampleBuilds';
import Pricing from '../sections/home/Pricing';
import Process from '../sections/home/Process';
import WhyThriko from '../sections/home/WhyThriko';
import FoundingPartner from '../sections/home/FoundingPartner';
import TechStack from '../sections/home/TechStack';
import Faq from '../sections/home/Faq';
import FinalCta from '../sections/home/FinalCta';

/** Section order for the landing page. Reorder here to restructure the page. */
export default function HomePage() {
  useDocumentTitle('Websites, Mobile Apps & AI Software');

  return (
    <>
      <Hero />
      <Services />
      <AiStudio />
      <ExampleBuilds />
      <Pricing />
      <Process />
      <WhyThriko />
      <FoundingPartner />
      <TechStack />
      <Faq />
      <FinalCta />
    </>
  );
}
