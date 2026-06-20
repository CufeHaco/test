import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
// === SECTION 1: IMPORTS AND TYPES ===
// All imports and TypeScript interfaces/types.

interface NavLink {
  label: string;
  href: string;
  dataSection: string;
}

interface BenefitItem {
  title: string;
  description: string;
  stat: string;
  icon: string;
  dataSection: string;
}

interface FeatureItem {
  title: string;
  description: string;
  steps: string[];
  accent: string;
  dataSection: string;
}

interface FAQItem {
  question: string;
  answer: string;
  dataSection: string;
}

interface FooterLink {
  label: string;
  href: string;
  dataSection: string;
}

interface PricingTier {
  name: string;
  price: string;
  description: string;
  items: string[];
  cta: string;
  featured: boolean;
  dataSection: string;
}

// === SECTION 2: CONSTANTS AND CONFIGURATION ===
// WORKSPACE_* constants and visual configuration only.
const WORKSPACE_BRAND_NAME = 'Gauge';
const WORKSPACE_TAGLINE = 'Fast electrical answers, right on site.';
const WORKSPACE_PRIMARY_COLOR = '#00a7ff';
const WORKSPACE_HIGHLIGHT_COLOR = '#ff5a1f';
const WORKSPACE_CONTRAST_COLOR = '#22e6a8';
const WORKSPACE_TYPOGRAPHY = 'Space Grotesk';
const WORKSPACE_FONT_FAMILY = '"Space Grotesk", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const WORKSPACE_SURFACE_PAGE = '#f2fbff';
const WORKSPACE_SURFACE_PAGE_ALT = '#e9fdf6';
const WORKSPACE_SURFACE_PANEL = '#d7fbef';
const WORKSPACE_SURFACE_PANEL_STRONG = '#caf9ea';
const WORKSPACE_SURFACE_ACCENT_SOFT = '#ffefe9';
const WORKSPACE_BORDER_COLOR = '#c7ecff';
const WORKSPACE_BORDER_STRONG_COLOR = '#a8e1ff';
const WORKSPACE_TEXT_PRIMARY = '#002f47';
const WORKSPACE_TEXT_SECONDARY = '#005a8a';
const WORKSPACE_TEXT_MUTED = '#0075b3';
const WORKSPACE_TEXT_ON_PRIMARY = '#111827';
const WORKSPACE_TEXT_ON_HIGHLIGHT = '#111827';
const WORKSPACE_TEXT_ON_CONTRAST = '#111827';
const WORKSPACE_HERO_GRADIENT = 'linear-gradient(135deg, #f2fbff 0%, #e9fdf6 50%, #fff3ef 100%)';
const WORKSPACE_LOGO_URL = 'https://storage.googleapis.com/audos-images/logo-studio/98e5292a-471e-41f5-8762-0d5620585cc9/6900f6e9-a057-47a5-acd2-8284e58ae00d.png';
const WORKSPACE_LOGO_ON_DARK_URL = 'https://storage.googleapis.com/audos-images/logo-studio/98e5292a-471e-41f5-8762-0d5620585cc9/6900f6e9-a057-47a5-acd2-8284e58ae00d.png';
const WORKSPACE_SPACE_URL = '/space/workspace-268244';
const WORKSPACE_HERO_VIDEO_URL = 'https://storage.googleapis.com/audos-images/generated-videos/openrouter-9YW4hIm9laM1XzS6xMaG-1781918676820.mp4';

// === SECTION 3: STRUCTURED CONTENT DATA ===
// Structured copy/data arrays and objects named NAV_LINKS, BENEFITS, FEATURES, FAQS, and FOOTER_LINKS.
const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features', dataSection: 'nav-1-label' },
  { label: 'How It Works', href: '#features', dataSection: 'nav-2-label' },
  { label: 'FAQ', href: '#faq', dataSection: 'nav-3-label' },
];

const HERO_CONTENT = {
  title: 'Field-ready electrical math in seconds',
  subtitle: WORKSPACE_TAGLINE,
  eyebrow: 'Load sizing • Voltage drop • Phase color lookup',
  cta: 'Get Started Free',
  secondaryCta: 'See the tools',
};

const BENEFITS: BenefitItem[] = [
  {
    title: 'Built for jobsite speed',
    description: 'Open the calculation you need, enter field values, and keep moving without hunting through spreadsheets or scattered notes.',
    stat: '3-tap flow',
    icon: '⚡',
    dataSection: 'benefit-1',
  },
  {
    title: 'Reference the right convention',
    description: 'Keep phase identification and color conventions close by so crews can confirm systems, regions, and jobsite standards quickly.',
    stat: 'Phase aware',
    icon: '●',
    dataSection: 'benefit-2',
  },
  {
    title: 'Reduce repeat math',
    description: 'Save sizing, voltage drop, wire, and circuit math results by job or circuit so estimates and troubleshooting notes stay organized.',
    stat: 'Job ledger',
    icon: '▣',
    dataSection: 'benefit-3',
  },
];

const FEATURES: FeatureItem[] = [
  {
    title: 'Circuit Ledger',
    description: 'Save and manage load sizing, voltage drop, wire size, and basic circuit math results by job or circuit.',
    steps: ['Create a job or circuit record', 'Run common electrical calculations', 'Store results for quoting, review, or field notes'],
    accent: 'Circuit',
    dataSection: 'feature-1',
  },
  {
    title: 'Phase Lookup',
    description: 'Log and reference phase identification and electrical color conventions by voltage system, region, and jobsite.',
    steps: ['Choose voltage system and region', 'Confirm phase colors and conventions', 'Add jobsite-specific reference notes'],
    accent: 'Phase',
    dataSection: 'feature-2',
  },
];

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Start Free',
    price: '$0',
    description: 'Use the core calculator flow and reference essentials immediately.',
    items: ['Quick electrical calculations', 'Phase lookup starter references', 'Basic saved job notes'],
    cta: 'Start free',
    featured: false,
    dataSection: 'pricing-1',
  },
  {
    name: 'Upgrade When Ready',
    price: '$12/mo',
    description: 'Unlock deeper saved ledgers, expanded references, and cleaner organization for active field work.',
    items: ['More saved circuits and jobs', 'Expanded phase convention library', 'Contractor-friendly organization'],
    cta: 'Upgrade when you need it',
    featured: true,
    dataSection: 'pricing-2',
  },
];

const FAQS: FAQItem[] = [
  {
    question: 'What can I calculate with Gauge?',
    answer: 'Gauge focuses on everyday field needs like load sizing, voltage drop, wire-related math, basic circuit calculations, and phase identification references.',
    dataSection: 'faq-1',
  },
  {
    question: 'Is Gauge a code book replacement?',
    answer: 'No. Gauge is a quick calculator and reference companion. Always verify final decisions against applicable electrical code, project specs, and your authority having jurisdiction.',
    dataSection: 'faq-2',
  },
  {
    question: 'Can I save calculations by job?',
    answer: 'Yes. The Circuit Ledger is designed to keep load sizing, voltage drop, wire size, and circuit math results organized by job or circuit.',
    dataSection: 'faq-3',
  },
  {
    question: 'How does Phase Lookup help crews?',
    answer: 'Phase Lookup helps log and reference electrical color conventions by voltage system, region, and jobsite so teams can confirm details faster in the field.',
    dataSection: 'faq-4',
  },
  {
    question: 'How does pricing work?',
    answer: 'You can start free with core tools, then upgrade when deeper saved records, expanded references, and contractor-friendly organization become worth it for your workflow.',
    dataSection: 'faq-5',
  },
];

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Features', href: '#features', dataSection: 'footer-link-1-label' },
  { label: 'FAQ', href: '#faq', dataSection: 'footer-link-2-label' },
  { label: 'Start Free', href: WORKSPACE_SPACE_URL, dataSection: 'footer-link-3-label' },
];

const FINAL_CTA = {
  title: 'Get the answer before the next callback.',
  description: 'Start free, upgrade when you’re ready. Keep the electrical math and field references you use most in one rugged, focused workspace.',
  cta: 'Open Gauge Free',
};

// === SECTION 4: NAVIGATION SECTION ===
// Navigation/header component only.
function Navigation() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrolled(scrollTop > 48);
      setScrollProgress(scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-0 z-[60] h-0.5 transition-all duration-150"
        style={{ width: `${scrollProgress}%`, backgroundColor: WORKSPACE_HIGHLIGHT_COLOR }}
      />
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-6 md:pt-6">
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-6 py-3 shadow-lg backdrop-blur-md transition-all duration-300 ${
            scrolled ? 'border border-gray-200/50 bg-white/90 text-gray-900' : 'bg-black/70 text-white'
          }`}
        >
          <a href="#hero" className="flex items-center gap-3">
            {WORKSPACE_LOGO_URL ? <div className="bg-white rounded-lg p-0.5 border border-gray-200"><img src={WORKSPACE_LOGO_URL} alt={WORKSPACE_BRAND_NAME} className="h-7 w-7 object-contain" /></div> : <span className="font-bold text-xl" style={{color: WORKSPACE_PRIMARY_COLOR}}>{WORKSPACE_BRAND_NAME.charAt(0)}</span>}
            <span
              className="font-bold tracking-tight"
              data-section="nav-brand-name"
              style={{ fontFamily: WORKSPACE_FONT_FAMILY }}
            >
              {WORKSPACE_BRAND_NAME}
            </span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.dataSection}
                href={link.href}
                className="text-sm font-semibold transition-colors hover:text-[var(--brand-highlight)]"
                data-section={link.dataSection}
              >
                {link.label}
              </a>
            ))}
            <a
              href={WORKSPACE_SPACE_URL}
              className="rounded-full px-5 py-2 text-sm font-bold shadow-md transition-transform duration-200 hover:scale-105"
              data-section="nav-cta"
              style={{ backgroundColor: WORKSPACE_HIGHLIGHT_COLOR, color: WORKSPACE_TEXT_ON_HIGHLIGHT }}
            >
              Start Free
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}

// === SECTION 5: HERO SECTION ===
// Hero component only.
function Hero() {
  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden min-h-screen">
      {WORKSPACE_HERO_VIDEO_URL ? <video src={WORKSPACE_HERO_VIDEO_URL} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0" /> : <div className="absolute inset-0" style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR }} />}
      <div className="absolute inset-0 z-[1] bg-black/45" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className="mb-7 flex flex-wrap items-center justify-center gap-3">
          {['A', 'B', 'C', 'N'].map((phase, index) => (
            <span
              key={phase}
              className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm"
              style={{ boxShadow: `inset 0 0 0 2px ${index === 0 ? WORKSPACE_PRIMARY_COLOR : index === 1 ? WORKSPACE_HIGHLIGHT_COLOR : index === 2 ? WORKSPACE_CONTRAST_COLOR : '#ffffff'}` }}
            >
              {phase} Phase
            </span>
          ))}
        </div>

        <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-white/80" data-section="hero-eyebrow">
          {HERO_CONTENT.eyebrow}
        </p>
        <h1
          className="mb-6 text-5xl font-bold leading-[0.95] text-white md:text-7xl"
          data-section="hero-title"
          style={{ fontFamily: WORKSPACE_FONT_FAMILY }}
        >
          {HERO_CONTENT.title}
        </h1>
        <p
          className="mx-auto mb-8 max-w-2xl text-xl text-white/90 md:text-2xl"
          data-section="hero-subtitle"
          style={{ fontFamily: WORKSPACE_FONT_FAMILY }}
        >
          {HERO_CONTENT.subtitle}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={WORKSPACE_SPACE_URL}
            className="group inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold shadow-md transition-transform duration-200 hover:scale-105"
            data-section="hero-cta-primary"
            style={{ backgroundColor: WORKSPACE_HIGHLIGHT_COLOR, color: WORKSPACE_TEXT_ON_HIGHLIGHT }}
          >
            <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent transition-transform duration-300 group-hover:rotate-180" />
            {HERO_CONTENT.cta}
          </a>
          <a
            href="#features"
            className="inline-block rounded-lg border border-white/40 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
            data-section="hero-cta-secondary"
          >
            {HERO_CONTENT.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

// === SECTION 6: SOCIAL PROOF SECTION ===
// Benefits, trust, or proof component only.
function SocialProof() {
  return (
    <section id="benefits" className="py-24" style={{ backgroundColor: WORKSPACE_SURFACE_PAGE }}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em]" data-section="benefits-eyebrow" style={{ color: WORKSPACE_HIGHLIGHT_COLOR }}>
            Trusted for the work between plans and panels
          </p>
          <h2
            className="text-4xl font-bold tracking-tight md:text-5xl"
            data-section="benefits-title"
            style={{ color: WORKSPACE_PRIMARY_COLOR, fontFamily: WORKSPACE_FONT_FAMILY }}
          >
            Faster checks. Cleaner notes. Fewer field slowdowns.
          </h2>
          <p className="mt-5 text-lg" data-section="benefits-description" style={{ color: WORKSPACE_TEXT_SECONDARY }}>
            {WORKSPACE_BRAND_NAME} keeps common electrical answers close at hand for electricians and contractors who need clarity without a cluttered workflow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <article
              key={benefit.dataSection}
              className="group rounded-xl border p-7 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: WORKSPACE_SURFACE_PANEL, borderColor: WORKSPACE_BORDER_COLOR }}
            >
              <div className="mb-6 flex items-center justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold"
                  style={{ backgroundColor: WORKSPACE_SURFACE_ACCENT_SOFT, color: WORKSPACE_HIGHLIGHT_COLOR }}
                >
                  {benefit.icon}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]"
                  data-section={`${benefit.dataSection}-stat`}
                  style={{ backgroundColor: WORKSPACE_CONTRAST_COLOR, color: WORKSPACE_TEXT_ON_CONTRAST }}
                >
                  {benefit.stat}
                </span>
              </div>
              <h3
                className="mb-3 text-2xl font-bold"
                data-section={`${benefit.dataSection}-title`}
                style={{ color: WORKSPACE_TEXT_PRIMARY, fontFamily: WORKSPACE_FONT_FAMILY }}
              >
                {benefit.title}
              </h3>
              <p className="leading-7" data-section={`${benefit.dataSection}-description`} style={{ color: WORKSPACE_TEXT_SECONDARY }}>
                {benefit.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.dataSection}
              className="rounded-xl border p-7 shadow-md"
              style={{
                backgroundColor: tier.featured ? WORKSPACE_SURFACE_ACCENT_SOFT : WORKSPACE_SURFACE_PANEL_STRONG,
                borderColor: tier.featured ? WORKSPACE_HIGHLIGHT_COLOR : WORKSPACE_BORDER_STRONG_COLOR,
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3
                    className="text-2xl font-bold"
                    data-section={`${tier.dataSection}-title`}
                    style={{ color: WORKSPACE_TEXT_PRIMARY, fontFamily: WORKSPACE_FONT_FAMILY }}
                  >
                    {tier.name}
                  </h3>
                  <p className="mt-2 leading-7" data-section={`${tier.dataSection}-description`} style={{ color: WORKSPACE_TEXT_SECONDARY }}>
                    {tier.description}
                  </p>
                </div>
                <p
                  className="rounded-full px-4 py-2 text-xl font-bold"
                  data-section={`${tier.dataSection}-price`}
                  style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, color: WORKSPACE_TEXT_ON_PRIMARY }}
                >
                  {tier.price}
                </p>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.items.map((item, index) => (
                  <li key={item} className="flex gap-3" style={{ color: WORKSPACE_TEXT_SECONDARY }}>
                    <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: WORKSPACE_CONTRAST_COLOR }} />
                    <span data-section={`${tier.dataSection}-item-${index + 1}`}>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href={WORKSPACE_SPACE_URL}
                className="mt-7 inline-block rounded-lg px-5 py-3 font-bold transition-transform duration-200 hover:scale-105"
                data-section={`${tier.dataSection}-cta`}
                style={{ backgroundColor: tier.featured ? WORKSPACE_HIGHLIGHT_COLOR : WORKSPACE_PRIMARY_COLOR, color: tier.featured ? WORKSPACE_TEXT_ON_HIGHLIGHT : WORKSPACE_TEXT_ON_PRIMARY }}
              >
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// === SECTION 7: FEATURES SECTION ===
// Features or how-it-works component only.
function Features() {
  return (
    <section id="features" className="py-24" style={{ backgroundColor: WORKSPACE_SURFACE_PAGE_ALT }}>
      <div className="mx-auto grid max-w-7xl items-start gap-16 px-4 lg:grid-cols-2">
        <div
          className="rounded-2xl border p-8 shadow-xl lg:sticky lg:top-24"
          style={{ backgroundColor: WORKSPACE_SURFACE_PANEL_STRONG, borderColor: WORKSPACE_BORDER_STRONG_COLOR }}
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em]" data-section="features-eyebrow" style={{ color: WORKSPACE_HIGHLIGHT_COLOR }}>
            How It Works
          </p>
          <h2
            className="text-4xl font-bold tracking-tight md:text-5xl"
            data-section="features-title"
            style={{ color: WORKSPACE_PRIMARY_COLOR, fontFamily: WORKSPACE_FONT_FAMILY }}
          >
            One focused workspace for electrical field checks.
          </h2>
          <p className="mt-5 text-lg leading-8" data-section="features-description" style={{ color: WORKSPACE_TEXT_SECONDARY }}>
            Run the calculation, confirm the convention, and store the answer where the job context lives.
          </p>

          <div className="mt-10 rounded-xl border p-6" style={{ backgroundColor: WORKSPACE_SURFACE_PAGE, borderColor: WORKSPACE_BORDER_COLOR }}>
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-[0.2em]" data-section="preview-title" style={{ color: WORKSPACE_TEXT_MUTED }}>
                Live field preview
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-bold" data-section="preview-status" style={{ backgroundColor: WORKSPACE_CONTRAST_COLOR, color: WORKSPACE_TEXT_ON_CONTRAST }}>
                Ready
              </span>
            </div>
            <div className="space-y-4">
              {['Load sizing', 'Voltage drop', 'Phase reference'].map((label, index) => (
                <div key={label} className="rounded-xl border p-4" style={{ borderColor: WORKSPACE_BORDER_COLOR, backgroundColor: index === 1 ? WORKSPACE_SURFACE_ACCENT_SOFT : WORKSPACE_SURFACE_PANEL }}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold" data-section={`preview-row-${index + 1}-label`} style={{ color: WORKSPACE_TEXT_PRIMARY }}>
                      {label}
                    </span>
                    <span className="h-3 w-20 rounded-full" style={{ backgroundColor: index === 0 ? WORKSPACE_PRIMARY_COLOR : index === 1 ? WORKSPACE_HIGHLIGHT_COLOR : WORKSPACE_CONTRAST_COLOR }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-7">
          {FEATURES.map((feature, featureIndex) => (
            <article
              key={feature.dataSection}
              className="group rounded-2xl border p-8 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: WORKSPACE_SURFACE_PAGE, borderColor: WORKSPACE_BORDER_COLOR }}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <span
                  className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]"
                  data-section={`${feature.dataSection}-accent`}
                  style={{ backgroundColor: featureIndex === 0 ? WORKSPACE_PRIMARY_COLOR : WORKSPACE_CONTRAST_COLOR, color: WORKSPACE_TEXT_ON_PRIMARY }}
                >
                  {feature.accent}
                </span>
                <span className="h-px flex-1" style={{ backgroundColor: WORKSPACE_BORDER_STRONG_COLOR }} />
                <span className="h-8 w-8 rounded-full border-4 border-t-transparent transition-transform duration-300 group-hover:rotate-180" style={{ borderColor: WORKSPACE_HIGHLIGHT_COLOR, borderTopColor: 'transparent' }} />
              </div>
              <h3
                className="mb-3 text-3xl font-bold"
                data-section={`${feature.dataSection}-title`}
                style={{ color: WORKSPACE_TEXT_PRIMARY, fontFamily: WORKSPACE_FONT_FAMILY }}
              >
                {feature.title}
              </h3>
              <p className="text-lg leading-8" data-section={`${feature.dataSection}-description`} style={{ color: WORKSPACE_TEXT_SECONDARY }}>
                {feature.description}
              </p>
              <div className="mt-7 space-y-4">
                {feature.steps.map((step, stepIndex) => (
                  <div key={step} className="flex gap-4">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: WORKSPACE_SURFACE_ACCENT_SOFT, color: WORKSPACE_HIGHLIGHT_COLOR }}
                    >
                      {stepIndex + 1}
                    </span>
                    <p className="pt-1 leading-7" data-section={`${feature.dataSection}-step-${stepIndex + 1}`} style={{ color: WORKSPACE_TEXT_SECONDARY }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// === SECTION 8: FAQ SECTION ===
// FAQ component only.
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="py-24" style={{ backgroundColor: WORKSPACE_SURFACE_PAGE }}>
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em]" data-section="faq-eyebrow" style={{ color: WORKSPACE_HIGHLIGHT_COLOR }}>
            FAQ
          </p>
          <h2
            className="text-4xl font-bold tracking-tight md:text-5xl"
            data-section="faq-title"
            style={{ color: WORKSPACE_PRIMARY_COLOR, fontFamily: WORKSPACE_FONT_FAMILY }}
          >
            Common field questions, answered.
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={faq.dataSection}
                className="overflow-hidden rounded-xl border shadow-md"
                style={{ backgroundColor: WORKSPACE_SURFACE_PANEL, borderColor: WORKSPACE_BORDER_COLOR }}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  data-section={`${faq.dataSection}-button`}
                >
                  <span
                    className="text-lg font-bold"
                    data-section={`${faq.dataSection}-q`}
                    style={{ color: WORKSPACE_TEXT_PRIMARY, fontFamily: WORKSPACE_FONT_FAMILY }}
                  >
                    {faq.question}
                  </span>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl font-bold transition-transform duration-200"
                    style={{
                      backgroundColor: isOpen ? WORKSPACE_HIGHLIGHT_COLOR : WORKSPACE_SURFACE_PAGE,
                      color: isOpen ? WORKSPACE_TEXT_ON_HIGHLIGHT : WORKSPACE_TEXT_MUTED,
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6">
                    <p className="leading-8" data-section={`${faq.dataSection}-a`} style={{ color: WORKSPACE_TEXT_SECONDARY }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// === SECTION 9: FINAL CTA AND FOOTER ===
// Final CTA and footer components only.
function FinalCTAAndFooter() {
  return (
    <>
      <section className="py-24" style={{ backgroundColor: WORKSPACE_SURFACE_PAGE_ALT }}>
        <div className="mx-auto max-w-5xl px-4">
          <div
            className="overflow-hidden rounded-2xl border p-10 text-center shadow-xl md:p-14"
            style={{ backgroundColor: WORKSPACE_PRIMARY_COLOR, borderColor: WORKSPACE_BORDER_STRONG_COLOR }}
          >
            <div className="mx-auto mb-7 h-16 w-16 rounded-full border-[10px] border-t-transparent" style={{ borderColor: WORKSPACE_HIGHLIGHT_COLOR, borderTopColor: 'transparent' }} />
            <h2
              className="text-4xl font-bold tracking-tight md:text-5xl"
              data-section="final-cta-title"
              style={{ color: WORKSPACE_TEXT_ON_PRIMARY, fontFamily: WORKSPACE_FONT_FAMILY }}
            >
              {FINAL_CTA.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8" data-section="final-cta-description" style={{ color: WORKSPACE_TEXT_ON_PRIMARY }}>
              {FINAL_CTA.description}
            </p>
            <a
              href={WORKSPACE_SPACE_URL}
              className="mt-8 inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-bold shadow-md transition-transform duration-200 hover:scale-105"
              data-section="cta-primary"
              style={{ backgroundColor: WORKSPACE_HIGHLIGHT_COLOR, color: WORKSPACE_TEXT_ON_HIGHLIGHT }}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: WORKSPACE_CONTRAST_COLOR }} />
              {FINAL_CTA.cta}
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t py-10" style={{ backgroundColor: WORKSPACE_SURFACE_PANEL_STRONG, borderColor: WORKSPACE_BORDER_COLOR }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              {WORKSPACE_LOGO_URL ? <div className="bg-white rounded-lg p-0.5 border border-gray-200"><img src={WORKSPACE_LOGO_URL} alt={WORKSPACE_BRAND_NAME} className="h-7 w-7 object-contain" /></div> : <span className="font-bold text-xl" style={{color: WORKSPACE_PRIMARY_COLOR}}>{WORKSPACE_BRAND_NAME.charAt(0)}</span>}
              <span className="text-xl font-bold" data-section="footer-brand-name" style={{ color: WORKSPACE_TEXT_PRIMARY, fontFamily: WORKSPACE_FONT_FAMILY }}>
                {WORKSPACE_BRAND_NAME}
              </span>
            </div>
            <p className="mt-3" data-section="footer-tagline" style={{ color: WORKSPACE_TEXT_SECONDARY }}>
              {WORKSPACE_TAGLINE}
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.dataSection}
                href={link.href}
                className="font-semibold transition-colors hover:text-[var(--brand-highlight)]"
                data-section={link.dataSection}
                style={{ color: WORKSPACE_TEXT_SECONDARY }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-sm" data-section="footer-copyright" style={{ color: WORKSPACE_TEXT_MUTED }}>
            © {new Date().getFullYear()} {WORKSPACE_BRAND_NAME}. Built for faster field checks.
          </p>
        </div>
      </footer>
    </>
  );
}

// === SECTION 10: MAIN COMPONENT AND ROOT RENDER ===
// Exported LandingPage composition plus exact DOM mounting code.
export default function LandingPage() {
  useEffect(() => {
    const existing = document.querySelector('link[href*="Space+Grotesk"]');
    if (!existing) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="min-h-full overflow-y-auto" style={{ backgroundColor: WORKSPACE_SURFACE_PAGE, color: WORKSPACE_TEXT_PRIMARY, fontFamily: WORKSPACE_FONT_FAMILY }}>
      <style>{`
        :root {
          --brand-font: ${WORKSPACE_FONT_FAMILY};
        }
        html {
          scroll-behavior: smooth;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        section > div {
          animation: fadeUp 520ms ease-out both;
        }
      `}</style>
      <Navigation />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <FAQ />
        <FinalCTAAndFooter />
      </main>
    </div>
  );
}

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<LandingPage />);