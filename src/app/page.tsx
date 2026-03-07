'use client';

import Image from 'next/image';

import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Shield,
  Bot,
  Inbox,
  BarChart3,
  Sparkles,
  Smartphone,
  Layout,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import TrustBar from '@/components/landing/TrustBar';
import FAQSection from '@/components/landing/FAQSection';
import WhatsAppButton from '@/components/landing/WhatsAppButton';
import TestimonialSection from '@/components/landing/TestimonialSection';
import PricingSection from '@/components/landing/PricingSection';
import ExitIntentPopup from '@/components/landing/ExitIntentPopup';
import CookieConsent from '@/components/landing/CookieConsent';
import MerchantCounter from '@/components/landing/MerchantCounter';

const FEATURES = [
  {
    icon: <Bot size={24} strokeWidth={2.5} />,
    title: 'Quick AI Shop Setup',
    desc: 'Just paste your Instagram link — we build your store, import products, and style your brand in 30 seconds.',
    color: '#6366f1',
    stat: 'Get online 90% faster',
  },
  {
    icon: <Inbox size={24} strokeWidth={2.5} />,
    title: 'All-in-One Inbox',
    desc: 'Reply to WhatsApp, Instagram, and website messages in one place. AI helps you respond faster and close more sales.',
    color: '#ec4899',
    stat: 'Manage 3 channels in 1 app',
  },
  {
    icon: <BarChart3 size={24} strokeWidth={2.5} />,
    title: 'Growth Reports',
    desc: 'See exactly what is selling best. Our AI tells you what to restock and how to price for more profit.',
    color: '#10b981',
    stat: 'Automatic sales tips',
  },
  {
    icon: <Layout size={24} strokeWidth={2.5} />,
    title: 'Your Own Online Store',
    desc: 'Get a beautiful, professional store with your own brand, colors, and domain — no coding needed.',
    color: '#f59e0b',
    stat: '100% Mobile Optimized',
  },
  {
    icon: <Shield size={24} strokeWidth={2.5} />,
    title: 'Secure & Reliable',
    desc: 'Your data and transactions are protected with bank-level security. Focus on selling, we handle the rest.',
    color: '#3b82f6',
    stat: '256-bit SSL + NDPR compliant',
  },
  {
    icon: <CheckCircle2 size={24} strokeWidth={2.5} />,
    title: 'Smart Inventory',
    desc: 'Real-time stock tracking with automated low-stock alerts, bulk uploads, and barcode scanning.',
    color: '#8b5cf6',
    stat: 'Syncs across POS & Online',
  }
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.landing}>
      <nav className={`${styles.navbar} ${isMenuOpen ? styles.navbarActive : ''}`}>
        <div className={styles.navBrand}>SOLO</div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
          <Link href="#features" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</Link>
          <Link href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
          <Link href="/login" className={styles.navLoginBtn}>Login</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroGlow1} />
        <div className={styles.heroGlow2} />

        <div className={styles.heroBadge}>
          <Sparkles size={14} className="text-accent" />
          <span>New: AI-Powered Onboarding for 2026</span>
        </div>

        <h1 className={styles.heroTitle}>
          Your Business. <br />
          <em>Empowered by</em> Marketplace Energy.
        </h1>

        <p className={styles.heroSubtitle}>
          The commerce platform built for Nigerian SMEs. Build a professional online store,
          sync your inventory, and use AI to grow your sales on WhatsApp and Instagram.
        </p>

        <div className={styles.heroCTA}>
          <Link href="/signup" className="btn btn-primary btn-lg group">
            Open My Free Store Now
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
          <Link href="#how-it-works" className="btn btn-outline btn-lg">
            Watch Demo
          </Link>
        </div>

        <div className={styles.heroMetrics}>
          <div className={styles.heroMetric}>
            <span className={styles.metricVal}>128</span>
            <span className={styles.metricLbl}>Products Synced</span>
          </div>
          <div className={styles.heroMetric}>
            <span className={styles.metricVal}>4.2k</span>
            <span className={styles.metricLbl}>Orders Processed</span>
          </div>
          <div className={styles.heroMetric}>
            <span className={styles.metricVal}>₦2.4M</span>
            <span className={styles.metricLbl}>Total Revenue</span>
          </div>
          <div className={styles.heroMetric}>
            <span className={styles.metricVal}>94%</span>
            <span className={styles.metricLbl}>Retention Rate</span>
          </div>
        </div>

        <MerchantCounter />

        <div className={styles.previewContainer}>
          <div className={styles.previewCard3D}>
            <div className={styles.pcHeader}>
              <div className={styles.pcLogo}>SOLO<span>.</span></div>
              <div style={{ marginRight: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                mystore.solo.app
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: 'var(--success-light)', color: 'var(--success)', padding: '2px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: 700, border: '1px solid rgba(14,122,79,0.1)' }}>
                <div style={{ width: '5px', height: '5px', background: 'var(--success)', borderRadius: '50%' }} />
                LIVE
              </div>
            </div>
            <div className={styles.pcBody}>
              <div className={styles.pcSidebar}>
                <div style={{ fontSize: '8px', fontWeight: 900, color: 'var(--muted)', letterSpacing: '1px', marginBottom: '12px' }}>DASHBOARD</div>
                {['Overview', 'Orders', 'Products', 'Insights'].map((item, i) => (
                  <div key={item} style={{ fontSize: '11px', fontWeight: 600, padding: '6px 8px', borderRadius: '6px', color: i === 0 ? 'var(--primary)' : 'var(--muted)', background: i === 0 ? 'var(--primary-light)' : 'transparent', marginBottom: '2px' }}>
                    {item}
                  </div>
                ))}
              </div>
              <div className={styles.pcMain}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>Business Overview</h4>
                <div className={styles.pcStatGrid}>
                  {['Revenue', 'Orders', 'Customers'].map(label => (
                    <div key={label} className={styles.pcStatItem}>
                      <div style={{ fontSize: '7px', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                        {label === 'Revenue' ? '₦430k' : label === 'Orders' ? '124' : '82'}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1.5rem', height: '100px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem' }}>
                  <div style={{ fontSize: '8px', fontWeight: 900, color: 'var(--muted)', marginBottom: '8px' }}>SALES TRENDS</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '50px' }}>
                    {[30, 60, 45, 80, 50, 90, 70].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', borderRadius: '2px 2px 0 0' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <TrustBar />

      <section id="features" className={styles.features}>
        <span className={styles.sectionLabel}>Features</span>
        <h2 className={styles.sectionTitle}>Everything You Need to Dominate Your Market</h2>
        <p className={styles.sectionSubtitle}>
          Professional tools that work as hard as you do, built for the next generation of commerce.
        </p>

        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon} style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
              <span className={styles.featureStat}>{f.stat}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className={styles.howItWorks}>
        <span className={styles.sectionLabel}>How It Works</span>
        <h2 className={styles.sectionTitle}>Three Steps to Launch</h2>

        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Connect Socials</h3>
            <p className={styles.stepDesc}>Link your Instagram or WhatsApp business profile to import your legacy branding.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>AI Generates Store</h3>
            <p className={styles.stepDesc}>Our AI builds your full product catalog and professional storefront automatically.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Start Selling</h3>
            <p className={styles.stepDesc}>Accept payments via Paystack, manage logistics, and grow your brand with AI tools.</p>
          </div>
        </div>
      </section>

      <TestimonialSection />

      <PricingSection />

      <FAQSection />

      <section className={styles.cta}>
        <div className={`card ${styles.ctaCard}`}>
          <h2 className={styles.ctaTitle}>Ready to Transform Your Business?</h2>
          <p className={styles.ctaSubtitle}>Be among the founding merchants building their legacy on SOLO.</p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Create My Account
          </Link>
          <p className="mt-4 text-xs text-secondary">Free forever for basic use. No credit card required.</p>
        </div>
      </section>

      <footer className={styles.footerEnhanced}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerLogo}>SOLO</div>
            <p className={styles.footerTagline}>
              Empowering the next generation of African SMEs with institutional-grade commerce tools.
            </p>
            <div className={styles.footerSocials}>
              <Link href="#" className={styles.footerSocialLink} aria-label="Instagram"><Instagram size={18} /></Link>
              <Link href="#" className={styles.footerSocialLink} aria-label="Facebook"><Facebook size={18} /></Link>
              <Link href="#" className={styles.footerSocialLink} aria-label="Twitter"><Twitter size={18} /></Link>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Platform</h4>
            <Link href="#features">Features</Link>
            <Link href="/store">Marketplace</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="/signup">Sign Up</Link>
          </div>

          <div className={styles.footerCol}>
            <h4>Resources</h4>
            <Link href="/blog">Blog</Link>
            <Link href="/docs">Help Center</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>

          <div className={styles.footerCol}>
            <h4>Contact</h4>
            <div className={styles.footerContactInfo}>
              <p><Mail size={14} className="inline mr-2" /> support@solosme.com</p>
              <p><Smartphone size={14} className="inline mr-2" /> +234 803 925 4849</p>
              <p className="mt-2 text-xs leading-relaxed">
                <MapPin size={14} className="inline mr-2" />
                3.Ibrahim Coomassie Road,<br />
                GRA Ring Road Katsina,<br />
                Nigeria
              </p>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span className={styles.footerCopyright}>
            © {new Date().getFullYear()} SOLO SME. All rights reserved.
          </span>
          <span className={styles.footerLocation}>
            🇳🇬 Proudly Nigerian
          </span>
        </div>
      </footer>

      <WhatsAppButton />
      <ExitIntentPopup />
      <CookieConsent />
    </div>
  );
}
