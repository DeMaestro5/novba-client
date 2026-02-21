export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string | null;
  images: string[];
  projectDate: string;
  client: string | null;
  technologies: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  caseStudy: string | null;
  testimonial: string | null;
  isPublished: boolean;
  order: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Fintech Dashboard Redesign',
    slug: 'fintech-dashboard-redesign',
    description: 'Complete redesign of a fintech SaaS dashboard serving 50,000+ users. Reduced user onboarding time by 40% and increased feature adoption by 28% through improved information architecture and visual hierarchy.',
    category: 'UI/UX Design',
    imageUrl: null,
    images: [],
    projectDate: '2024-11-01',
    client: 'Acme Corp',
    technologies: ['Figma', 'React', 'TypeScript', 'Tailwind CSS'],
    liveUrl: 'https://example.com',
    githubUrl: null,
    caseStudy: 'The client came to us with a dashboard that had 60% drop-off during onboarding. After conducting 12 user interviews and 3 rounds of usability testing, we identified that the primary navigation was burying critical workflows 3 levels deep. The redesign consolidated 14 top-level nav items into 6 logical groups, added contextual empty states, and introduced a progressive disclosure pattern for advanced features. Result: onboarding completion went from 38% to 79% in 6 weeks post-launch.',
    testimonial: 'The redesign transformed how our users interact with the product. We saw results faster than we expected — the numbers speak for themselves.',
    isPublished: true,
    order: 0,
    views: 142,
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 'p2',
    title: 'E-commerce Mobile App',
    slug: 'ecommerce-mobile-app',
    description: 'Full-stack mobile application for a fashion e-commerce brand. Built from design system to production deployment. Handles $2M+ in monthly transactions with 99.9% uptime.',
    category: 'Full-Stack Development',
    imageUrl: null,
    images: [],
    projectDate: '2024-09-01',
    client: 'TechStart Inc',
    technologies: ['React Native', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/example',
    caseStudy: 'Built a greenfield mobile commerce app in 12 weeks from initial brief to App Store approval. The key technical challenge was implementing a real-time inventory system that could handle flash sale traffic spikes without overselling. We used PostgreSQL advisory locks combined with Redis caching to solve this. The Stripe integration supports 14 currencies with automatic tax calculation.',
    testimonial: 'Delivered exactly what we needed, on time and on budget. The technical quality was exceptional — our internal team was impressed.',
    isPublished: true,
    order: 1,
    views: 89,
    createdAt: '2024-09-20T10:00:00Z',
    updatedAt: '2024-09-20T10:00:00Z',
  },
  {
    id: 'p3',
    title: 'Brand Identity — Growth Labs',
    slug: 'brand-identity-growth-labs',
    description: 'Complete brand identity for a B2B growth consultancy. Logo system, color palette, typography, brand guidelines, and marketing collateral across digital and print.',
    category: 'Brand Design',
    imageUrl: null,
    images: [],
    projectDate: '2024-07-01',
    client: 'Growth Labs',
    technologies: ['Illustrator', 'Figma', 'After Effects'],
    liveUrl: null,
    githubUrl: null,
    caseStudy: null,
    testimonial: 'Our new brand has completely changed how prospects perceive us. We\'ve closed 3 enterprise deals since launch and the feedback is always that we "look like a serious company now".',
    isPublished: true,
    order: 2,
    views: 67,
    createdAt: '2024-07-10T10:00:00Z',
    updatedAt: '2024-07-10T10:00:00Z',
  },
  {
    id: 'p4',
    title: 'SaaS Landing Page',
    slug: 'saas-landing-page',
    description: 'High-converting landing page for a project management SaaS. A/B tested copy and layout. Currently converting at 8.3% — 3x industry average.',
    category: 'Web Design',
    imageUrl: null,
    images: [],
    projectDate: '2024-05-01',
    client: 'Solo Ventures',
    technologies: ['Next.js', 'Framer Motion', 'Tailwind CSS'],
    liveUrl: 'https://example.com',
    githubUrl: null,
    caseStudy: null,
    testimonial: null,
    isPublished: false,
    order: 3,
    views: 12,
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-05-15T10:00:00Z',
  },
];

export const MOCK_PUBLIC_PROFILE = {
  name: 'Stephen Okafor',
  title: 'UI/UX Designer & Full-Stack Developer',
  bio: 'I help startups and scale-ups turn complex problems into products people actually use. 6 years building digital products across fintech, e-commerce, and SaaS. Available for new projects.',
  location: 'Lagos, Nigeria',
  isAvailable: true,
  email: 'stephen@novba.com',
  linkedinUrl: 'https://linkedin.com',
  twitterUrl: 'https://twitter.com',
  githubUrl: 'https://github.com',
  slug: 'stephen-okafor',
  totalViews: 310,
  totalProjects: 3,
};

export const PORTFOLIO_CATEGORIES = [
  'UI/UX Design',
  'Full-Stack Development',
  'Frontend Development',
  'Backend Development',
  'Brand Design',
  'Motion Design',
  'Web Design',
  'Mobile App',
  'Content Writing',
  'Marketing',
  'Video Production',
  'Other',
];
