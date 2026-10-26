import { sectionHref, sectionIds } from '../../routes';

export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation, shared by the header and footer. */
export const primaryNav: NavItem[] = [
  { label: 'Services', href: sectionHref(sectionIds.services) },
  { label: 'AI Studio', href: sectionHref(sectionIds.ai) },
  { label: 'Work', href: sectionHref(sectionIds.work) },
  { label: 'Pricing', href: sectionHref(sectionIds.pricing) },
  { label: 'Process', href: sectionHref(sectionIds.process) },
  { label: 'About', href: sectionHref(sectionIds.about) },
];
