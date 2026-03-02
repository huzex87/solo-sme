import { Zap, MessageSquare, BarChart3, Palette, Shield, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import IconWrapper from '@/components/ui/IconWrapper';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: <Zap size={24} strokeWidth={2.5} />,
    title: 'AI Onboarding',
    desc: 'Drop an Instagram link — we build your storefront, import products, and style your brand in 30 seconds.',
    color: 'var(--accent-primary)',
  },
  {
    icon: <MessageSquare size={24} strokeWidth={2.5} />,
    title: 'All-in-One Inbox',
    desc: 'Reply to WhatsApp, Instagram, and website messages in one place. AI helps you respond faster and close more sales.',
    color: 'var(--accent-secondary)',
  },
  {
    icon: <BarChart3 size={24} strokeWidth={2.5} />,
    title: 'Smart Insights',
    desc: 'See what\'s selling, what\'s running low, and get suggestions to grow your sales — all powered by AI.',
    color: 'var(--color-success)',
  },
  {
    icon: <Palette size={24} strokeWidth={2.5} />,
    title: 'Your Own Online Store',
    desc: 'Get a beautiful, professional store with your own brand, colors, and domain — no coding needed.',
    color: 'var(--color-warning)',
  },
  {
    icon: <Shield size={24} strokeWidth={2.5} />,
    title: 'Secure & Reliable',
    desc: 'Your data and transactions are protected with bank-level security. Focus on selling, we handle the rest.',
    color: 'var(--color-error)',
  },
  {
    icon: <Package size={24} strokeWidth={2.5} />,
    title: 'Smart Inventory',
    desc: 'Real-time stock tracking with automated low-stock alerts, bulk uploads, and barcode scanning.',
    color: '#448AFF',
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
    features: ['Unlimited products', 'Custom domain', 'Detailed analytics', 'All-in-one inbox', 'AI sales assistant', 'Priority support'],
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

        <div className={`glass ${styles.heroBadge}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <Sparkles size={16} color="var(--accent-secondary)" />
          The #1 Platform for African Small Businesses
        </div>

        <h1 className={`gradient-text ${styles.heroTitle}`}>
          Run Your Entire Business From One Place
        </h1>

        <p className={styles.heroSubtitle}>
          SOLO gives your business everything it needs to grow. Smart inventory management,
          sell across all channels, and a stunning online store — all in one place.
        </p>

        <div className={styles.heroCTA}>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Launch My Store — Free
          </Link>
          <Link href="#features" className="btn btn-secondary btn-lg">
            See How It Works
          </Link>
        </div>

        {/* Global Hero Graphic */}
        <div className={styles.heroGraphicContainer}>
          <img
            src="/brain/ac698879-4e07-47b6-9296-73298435a5b6/solo_hero_graphic_v2_1772472362257.png"
            alt="SOLO Dashboard Preview"
            className={styles.heroGraphic}
          />
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
              <div style={{ marginBottom: '1.5rem' }}>
                <IconWrapper color={f.color} size="md">
                  {f.icon}
                </IconWrapper>
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
