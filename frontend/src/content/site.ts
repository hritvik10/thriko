/**
 * All marketing copy for the site lives here, so it can be edited without
 * touching component code. Components import these typed objects.
 */
import type { IconName } from '../components/ui/Icon';

export interface Service {
  icon: IconName;
  title: string;
  description: string;
  deliverables: string[];
  cta: string;
}

export interface AiCapability {
  icon: IconName;
  title: string;
  description: string;
  examples: string[];
}

export interface ExampleBuild {
  category: string;
  title: string;
  description: string;
  features: string[];
  stack: string[];
  /** Visual style of the illustrative mockup on the card. */
  visual: 'dashboard' | 'phone' | 'storefront' | 'chat';
}

export interface ProcessStep {
  title: string;
  description: string;
  outputs: string[];
}

export interface Differentiator {
  icon: IconName;
  title: string;
  description: string;
}

export interface Commitment {
  label: string;
  value: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PricingTier {
  name: string;
  /** Short price line, e.g. "From $1,000". */
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const hero = {
  badge: 'Premium quality · Affordable prices · Guaranteed',
  titleStart: 'Software your business can',
  titleHighlight: 'depend on.',
  lead: 'Thriko designs and builds secure, scalable websites, mobile apps and AI-powered software, with transparent pricing, weekly demos and one dedicated team accountable for the result.',
  primaryCta: 'Book a Free Call',
  secondaryCta: 'Explore what we build',
  checks: ['Projects from $1,000', 'You own 100% of the code', 'No hourly-rate surprises'],
};

export const principles = [
  'Projects from $1,000',
  'Fixed, itemised proposals',
  'A demo every week',
  'Senior engineers only',
  'Your IP from day one',
];

export const pricing = {
  kicker: 'Pricing',
  title: 'Premium quality. Affordable prices. Guaranteed.',
  lead: 'Every budget is welcome. If your requirements are simple, your price will be too, with the same senior team and the same quality on every project.',
  tiers: [
    {
      name: 'Starter',
      price: 'From $1,000',
      priceNote: 'Typical range $1,000 – $5,000',
      description: 'For simple needs: get online fast with a professional, mobile-friendly presence.',
      features: ['Landing page or 1–5 page website', 'Mobile-friendly and fast', 'Contact form and basic SEO', 'Small fixes and updates'],
      cta: 'Start small',
    },
    {
      name: 'Growth',
      price: '$5,000 – $25,000',
      priceNote: 'Most popular',
      description: 'Custom websites, web apps and first versions of mobile apps.',
      features: ['Custom design and CMS', 'Web app or MVP mobile app', 'Payments, logins and integrations', 'Analytics and launch support'],
      highlighted: true,
      cta: 'Get a quote',
    },
    {
      name: 'Scale',
      price: '$25,000 – $50,000+',
      priceNote: 'For complex products',
      description: 'Full platforms, iOS and Android apps, and AI-powered software.',
      features: ['Complex platforms and dashboards', 'Native or cross-platform apps', 'AI integrations, MCP and agents', 'Security reviews and scaling'],
      cta: 'Discuss your project',
    },
  ] satisfies PricingTier[],
  promise: {
    title: 'Our affordability promise',
    body: 'Tight budget or very basic requirements? Tell us. We will recommend the leanest option that does the job, never upsell features you do not need, and keep the price fixed before work starts.',
  },
  footnote: 'Ranges are a guide. Your exact price is fixed in a written proposal after a free call.',
};

export const services: Service[] = [
  {
    icon: 'monitor',
    title: 'Website Development',
    description:
      'Corporate websites, marketing sites and web applications that are fast, accessible and easy for your team to update.',
    deliverables: [
      'A CMS your team can edit without a developer',
      'WCAG 2.2 AA accessibility as standard',
      'Integrations with CRM, payments and analytics',
    ],
    cta: 'Discuss a website',
  },
  {
    icon: 'phone',
    title: 'Mobile App Development',
    description:
      'iOS, Android and cross-platform apps built with Swift, Kotlin, Flutter or React Native, chosen to fit your budget and roadmap.',
    deliverables: [
      'App Store and Google Play submission handled',
      'Offline mode, push notifications and SSO',
      'Secure APIs and analytics built in',
    ],
    cta: 'Discuss an app',
  },
  {
    icon: 'layers',
    title: 'UI/UX Design',
    description:
      'User research, journey mapping and tested prototypes, so you invest only in features your customers will use.',
    deliverables: [
      'Stakeholder and user workshops',
      'Clickable prototypes and usability testing',
      'A documented design system',
    ],
    cta: 'Discuss design',
  },
  {
    icon: 'shield',
    title: 'Maintenance & Support',
    description:
      'Flexible Maintenance plans covering monitoring, security patches, backups and continuous improvement, sized to what you need.',
    deliverables: [
      'Uptime monitoring and incident response',
      'Regular security and dependency updates',
      'Roadmap reviews and improvement sprints',
    ],
    cta: 'See support options',
  },
];

export const aiSection = {
  tag: 'Premium · Thriko AI Studio',
  title: 'Put AI to work inside your product',
  lead: 'From a single smart feature to fully autonomous workflows, we design, build and safely run AI that connects to your real data and tools.',
  capabilities: [
    {
      icon: 'sparkles',
      title: 'LLM Integrations',
      description:
        'Add large language models to your product: assistants, smart search, summaries and document Q&A grounded in your own data.',
      examples: ['OpenAI, Anthropic Claude, Gemini', 'Open-source models (Llama, Mistral)', 'RAG over your documents'],
    },
    {
      icon: 'plug',
      title: 'MCP Servers',
      description:
        'Model Context Protocol servers that give AI assistants secure, permissioned access to your databases, APIs and internal tools.',
      examples: ['Custom MCP servers', 'Role-based access controls', 'Audit logs for every call'],
    },
    {
      icon: 'workflow',
      title: 'Agentic Workflows',
      description:
        'Multi-step AI agents that research, draft, decide and act across your systems, with a human approval step wherever it matters.',
      examples: ['Lead qualification and follow-up', 'Support triage and drafting', 'Back-office automation'],
    },
    {
      icon: 'cpu',
      title: 'AI-Powered Software',
      description:
        'New products designed AI-first, with evaluation, guardrails and cost monitoring built in from the first sprint.',
      examples: ['Copilots for your team', 'Internal knowledge tools', 'AI features for existing apps'],
    },
  ] satisfies AiCapability[],
  flow: ['Your data & tools', 'MCP server', 'LLM', 'Agent', 'Human approval', 'Action'],
  safeguards: [
    'Your data is never used to train public models',
    'Evaluation suites to measure accuracy',
    'Guardrails, rate limits and spend caps',
    'Clear logs of what the AI did and why',
  ],
  cta: 'Discuss an AI project',
};

export const exampleBuilds = {
  title: 'What we can build for you',
  lead: 'A few of the products we are set up to deliver. These are example blueprints, not client case studies.',
  items: [
    {
      category: 'SaaS · Web platform',
      title: 'Subscription dashboard',
      description: 'Sign-up, billing, team accounts and reporting for a B2B software product.',
      features: ['Stripe billing', 'Role-based access', 'Usage analytics'],
      stack: ['Next.js', 'Node.js', 'PostgreSQL'],
      visual: 'dashboard',
    },
    {
      category: 'Services · Mobile app',
      title: 'Booking & scheduling app',
      description: 'Customers book, pay and get reminders; staff manage calendars on the go.',
      features: ['Calendar sync', 'In-app payments', 'Push reminders'],
      stack: ['Flutter', 'Firebase'],
      visual: 'phone',
    },
    {
      category: 'Retail · E-commerce',
      title: 'Online storefront',
      description: 'A fast, SEO-friendly shop with subscriptions and inventory sync.',
      features: ['Headless CMS', 'Subscriptions', 'Inventory sync'],
      stack: ['Next.js', 'Shopify API'],
      visual: 'storefront',
    },
    {
      category: 'AI · Agentic workflow',
      title: 'AI support assistant',
      description: 'Answers customer questions from your docs and hands complex cases to your team.',
      features: ['RAG on your docs', 'MCP tool access', 'Human hand-off'],
      stack: ['Python', 'Claude / GPT', 'MCP'],
      visual: 'chat',
    },
  ] satisfies ExampleBuild[],
};

export const processSteps: ProcessStep[] = [
  {
    title: 'Discover',
    description: 'Requirements workshops, a technical audit and a risk review of your idea.',
    outputs: ['Fixed-price proposal', 'Project plan & milestones'],
  },
  {
    title: 'Design',
    description: 'User flows, wireframes and an interactive prototype for your sign-off.',
    outputs: ['Tested prototype', 'Design system'],
  },
  {
    title: 'Build',
    description: 'Agile sprints with QA, code review and a working demo every week.',
    outputs: ['Staging environment', 'Automated tests'],
  },
  {
    title: 'Launch & Support',
    description: 'Go-live, training and handover documentation, then the Maintenance plan you choose.',
    outputs: ['Launch checklist', 'Flexible Maintenance plan'],
  },
];

export const whyThriko = {
  title: 'A partner you can hold accountable',
  lead: 'We are a focused senior team. That means fewer hand-offs, faster decisions and one point of contact who knows your project inside out.',
  differentiators: [
    {
      icon: 'clock',
      title: 'Fast, predictable delivery',
      description: 'Milestones agreed up front and a working demo every week, so progress is never a guess.',
    },
    {
      icon: 'list',
      title: 'Transparent, fixed pricing',
      description: 'Itemised proposals with no hourly surprises. Any change is quoted before it is built.',
    },
    {
      icon: 'users',
      title: 'A dedicated team',
      description: 'Your project lead, designer and engineers stay with you from kickoff to launch.',
    },
    {
      icon: 'shield',
      title: 'Support after launch',
      description: 'Maintenance plans that fit your needs, from light monitoring to ongoing feature work.',
    },
  ] satisfies Differentiator[],
  commitments: [
    { label: 'Reply to your enquiry', value: 'Within 1 business day' },
    { label: 'Pricing', value: 'From $1,000, fixed' },
    { label: 'Progress updates', value: 'Every week' },
    { label: 'Code & IP ownership', value: '100% yours' },
    { label: 'After launch', value: 'Maintenance plan of your choice' },
  ] satisfies Commitment[],
};

export const foundingPartner = {
  tag: 'Founding Partner Program',
  title: 'Be one of our first partners, and get more for it',
  lead: 'Thriko is a new studio. We are taking on a small number of founding clients who will get senior attention and benefits that will not be offered later.',
  benefits: [
    { icon: 'star', title: 'Founding-partner pricing', description: 'Preferential rates, locked in for your first project.' },
    { icon: 'users', title: 'Direct founder access', description: 'Work directly with the founders on every decision.' },
    { icon: 'calendar', title: 'Priority scheduling', description: 'Your project goes to the front of our calendar.' },
    { icon: 'sparkles', title: 'Free AI readiness review', description: 'We map where AI could save you time or money.' },
  ] satisfies Differentiator[],
  note: 'Limited places. We will be honest about fit before you commit to anything.',
  cta: 'Apply as a founding partner',
};

export const techStack = [
  { group: 'Web', items: ['React', 'Next.js', 'TypeScript'] },
  { group: 'Mobile', items: ['Flutter', 'React Native', 'Swift', 'Kotlin'] },
  { group: 'Back end', items: ['Node.js', 'Python', 'PostgreSQL', 'GraphQL'] },
  { group: 'AI', items: ['OpenAI', 'Claude', 'LangGraph', 'MCP'] },
  { group: 'Cloud & tools', items: ['AWS', 'Firebase', 'Docker', 'Figma'] },
];

export const faqs: FaqItem[] = [
  {
    question: 'How much does a project cost?',
    answer:
      'Projects start from $1,000 for simple websites, and larger platforms range up to $50,000+. After a free 30-minute call we send a fixed, itemised proposal, so you know the full price before any work starts.',
  },
  {
    question: 'We have a small budget. Can you still help?',
    answer:
      'Yes. If your requirements are basic, we guarantee an affordable price and recommend the leanest option that does the job, with the same quality standards as our larger projects.',
  },
  {
    question: 'You are a new studio. Why should we trust you?',
    answer:
      'Every project is led by senior engineers and designers, priced up front and demoed weekly, so you see real progress at every step. You can also start small with a discovery phase before committing to a full build.',
  },
  {
    question: 'Do we own the code and designs?',
    answer: 'Yes. Everything we create for you belongs to you, including source code, designs and documentation.',
  },
  {
    question: 'Can you add AI to an existing product?',
    answer:
      'Yes. We regularly plan AI features for products that already exist, such as an assistant, smart search or an automated workflow, and connect them safely to your current systems.',
  },
  {
    question: 'What happens after launch?',
    answer:
      'You choose a Maintenance plan that suits you, from monitoring and security updates to ongoing feature sprints. Or we hand over full documentation so your own team can take it from there.',
  },
  {
    question: 'Will you sign an NDA?',
    answer: 'Of course. We are happy to sign your NDA before our first call.',
  },
];

export const finalCta = {
  title: 'Planning a website, app or AI project?',
  lead: 'Book a free 30-minute consultation. You will get honest advice, a realistic plan and a budget range, with no obligation.',
  primary: 'Book a Free Call',
  secondary: 'Request a Quote',
};

export const contactPage = {
  kicker: 'Request a quote',
  title: "Let's scope your project",
  lead: 'Share a few details and a senior consultant will reply within one business day.',
  nextSteps: [
    { title: 'We review your brief', description: 'A senior team member reads every enquiry personally.' },
    { title: 'Free discovery call', description: 'A 30-minute call to understand your goals, users and constraints. NDA available.' },
    { title: 'Your written proposal', description: 'A fixed-price proposal with clear scope and milestones.' },
  ],
  assurances: ['No obligation, the proposal is yours to keep', 'Your details are never shared', 'NDA available before we talk'],
  affordability: {
    title: 'Affordable prices, guaranteed',
    body: 'Whatever your budget, we will recommend the leanest option that does the job, at a fair, fixed price and without cutting quality.',
  },
};

/** Shown under the budget field; the low-budget variant appears for the smallest ranges. */
export const budgetHints = {
  noCountry: 'Choose your country to see prices in your local currency.',
  default: 'Enter your approximate total budget. A rough figure is fine.',
  lowBudget:
    'Great, small budgets are welcome. We guarantee an affordable price and will suggest the leanest option that fits.',
  notSure: 'No problem. We will suggest options for different budgets, with affordable prices guaranteed.',
};
