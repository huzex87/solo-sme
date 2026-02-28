import Link from 'next/link';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: '⚡',
    title: 'AI Onboarding',
    desc: 'Drop an Instagram link — we build your storefront, import products, and style your brand in 30 seconds.',
    bg: 'rgba(124, 77, 255, 0.1)',
  },
  {
    icon: '💬',
    title: 'Omnichannel Hub',
    desc: 'Unified inbox for WhatsApp, Instagram, and Web sales with AI-powered sales support that helps close deals.',
    bg: 'rgba(0, 229, 255, 0.1)',
  },
  {
    icon: '📊',
    title: 'Predictive Intelligence',
    desc: 'AI analyzes sales patterns, predicts stock needs, suggests product bundles, and automates marketing.',
    bg: 'rgba(0, 200, 83, 0.1)',
  },
  {
    icon: '🎨',
    title: 'White-Label Storefront',
    desc: 'Your own custom domain, branding, and a storefront that looks like a bespoke high-end app — not a template.',
    bg: 'rgba(255, 193, 7, 0.1)',
  },
  {
    icon: '🔐',
    title: 'Enterprise Security',
    desc: 'SOC-2 compliant data isolation, end-to-end encryption, and atomic financial operations.',
    bg: 'rgba(255, 61, 87, 0.1)',
  },
  {
    icon: '📦',
    title: 'Smart Inventory',
    desc: 'Real-time stock tracking with automated low-stock alerts, bulk uploads, and barcode scanning.',
    bg: 'rgba(68, 138, 255, 0.1)',
  },
];

const STEPS = [
  { num: '1', title: 'Sign Up in Seconds', desc: 'Create your account and tell us about your business. Our AI starts building immediately.' },
  { num: '2', title: 'Customize Everything', desc: 'Pick your colors, domain, and layout. Or let our AI do it from your social media.' },
  { num: '3', title: 'Start Selling', desc: 'Add products, share your link, and watch orders roll in from every channel.' },
];

const PRICING = [
  {
    tier: 'Starter',
    price: 'Free',
    period: 'forever',
    features: ['Up to 50 products', 'SOLO subdomain', 'Basic analytics', 'WhatsApp integration', 'Email support'],
    popular: false,
  },
  {
    tier: 'Growth',
    price: '₦9,900',
    period: '/month',
    features: ['Unlimited products', 'Custom domain', 'Advanced analytics', 'Omnichannel inbox', 'AI sales assistant', 'Priority support'],
    popular: true,
  },
  {
    tier: 'Enterprise',
    price: '₦49,900',
    period: '/month',
    features: ['Everything in Growth', 'Multi-store management', 'API access', 'White-label mobile app', 'Dedicated account manager', 'Custom integrations'],
    popular: false,
  },
];

export default function HomePage() {
  return (
    <div className={styles.landing}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <span className={`gradient-text ${styles.navBrand}`}>SOLO</span>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow1} />
        <div className={styles.heroGlow2} />

        <div className={`glass ${styles.heroBadge}`}>
          ✨ The #1 Business Brain for African SMEs
        </div>

        <h1 className={`gradient-text ${styles.heroTitle}`}>
          Run Your Entire Business From One Place
        </h1>

        <p className={styles.heroSubtitle}>
          SOLO gives every SME the superpowers of a Fortune 500 company. AI-driven inventory,
          omnichannel sales, and a stunning storefront — all in one platform.
        </p>

        <div className={styles.heroCTA}>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Launch My Store — Free
          </Link>
          <Link href="#features" className="btn btn-secondary btn-lg">
            See How It Works
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <span className={styles.sectionLabel}>Features</span>
        <h2 className={styles.sectionTitle}>Everything You Need to Dominate Your Market</h2>
        <p className={styles.sectionSubtitle}>
          No more juggling 10 different apps. SOLO brings it all together.
        </p>

        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon} style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <span className={styles.sectionLabel}>How It Works</span>
        <h2 className={styles.sectionTitle}>Go Live in Three Steps</h2>
        <p className={styles.sectionSubtitle}>
          From zero to selling — faster than you can brew a cup of coffee.
        </p>

        <div className={styles.stepsGrid}>
          {STEPS.map(s => (
            <div key={s.num} className={styles.step}>
              <div className={styles.stepNumber}>{s.num}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.pricing}>
        <span className={styles.sectionLabel}>Pricing</span>
        <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
        <p className={styles.sectionSubtitle}>
          Start free. Scale when you&apos;re ready.
        </p>

        <div className={styles.pricingGrid}>
          {PRICING.map(p => (
            <div key={p.tier} className={`card ${styles.pricingCard} ${p.popular ? styles.pricingPopular : ''}`}>
              {p.popular && <span className={styles.popularTag}>Most Popular</span>}
              <div className={styles.pricingTier}>{p.tier}</div>
              <div className={styles.pricingAmount}>{p.price}</div>
              <div className={styles.pricingPeriod}>{p.period}</div>
              <ul className={styles.pricingFeatures}>
                {p.features.map(feat => (
                  <li key={feat}>{feat}</li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`btn ${p.popular ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%' }}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={`card ${styles.ctaCard}`}>
          <h2 className={styles.ctaTitle}>Ready to Transform Your Business?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of SMEs already growing with SOLO.
            Set up takes less than 30 seconds.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Start Free Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={`gradient-text ${styles.footerBrand}`}>SOLO</span>
          <div className={styles.footerLinks}>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} SOLO. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
