/** Central list of routes and in-page anchors, so links never drift apart. */
export const routes = {
  home: '/',
  contact: '/contact',
} as const;

export const sectionIds = {
  services: 'services',
  ai: 'ai',
  work: 'work',
  pricing: 'pricing',
  process: 'process',
  about: 'about',
  faq: 'faq',
} as const;

/** Build a link to a home-page section that works from any page. */
export function sectionHref(id: (typeof sectionIds)[keyof typeof sectionIds]): string {
  return `${routes.home}#${id}`;
  
}
