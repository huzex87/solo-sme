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
  X,
  Play
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
    icon: <Bot size={20} />,
    title: 'Quick AI Shop Setup',
    desc: 'Just paste your Instagram link — we build your store, import products, and style your brand in 30 seconds.',
    color: '#00798C',
    stat: 'Get online 90% faster',
  },
  {
    icon: <Inbox size={20} />,
    title: 'All-in-One Inbox',
    desc: 'Reply to WhatsApp, Instagram, and website messages in one place. AI helps you respond faster and close more sales.',
    color: '#ec4899',
    stat: 'Manage 3 channels in 1 app',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Growth Reports',
    desc: 'See exactly what is selling best. Our AI tells you what to restock and how to price for more profit.',
    color: '#10b981',
    stat: 'Automatic sales tips',
  },
  {
    icon: <Layout size={20} />,
    title: 'Your Own Online Store',
    desc: 'Get a beautiful, professional store with your own brand, colors, and domain — no coding needed.',
    color: '#f59e0b',
    stat: '100% Mobile Optimized',
  },
  {
    icon: <Shield size={20} />,
    title: 'Secure & Reliable',
    desc: 'Your data and transactions are protected with bank-level security. Focus on selling, we handle the rest.',
    color: '#3b82f6',
    stat: 'SSL + NDPR compliant',
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: 'Smart Inventory',
    desc: 'Real-time stock tracking with automated low-stock alerts, bulk uploads, and barcode scanning.',
    color: '#00798C',
    stat: 'Syncs across POS & Online',
  }
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.landing}>
      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navBrand}>
          SOLO<span className={styles.navBrandDot}>.</span>
        </Link>

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
          <Link href="#features">Features</Link>
          <Link href="#how-it-works">How It Works</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="#faq">FAQ</Link>
        </div>

        <div className={styles.navCTAGroup}>
          <Link href="/login" className={styles.navLoginBtn}>Login</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          <button className={styles.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className={styles.heroGridLines} />

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <div className={styles.heroEyebrowDot} />
              PRE-LAUNCH PHASE v2.0
            </div>

            <h1 className={styles.heroTitle}>
              Build your legacy <br />
              on <span className={styles.heroTitleAccent}>Sovereign Ground.</span>
            </h1>

            <p className={styles.heroSubtitle}>
              World-class commerce tools for the next generation of Nigerian merchants.
              Beautiful digital storefronts, smart POS, and AI-driven growth insights.
            </p>

            <div className={styles.heroCTA}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start My Free Store <ArrowRight size={16} />
              </Link>
              <Link href="#demo" className="btn btn-ghost btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.15)' }}>
                <Play size={16} fill="currentColor" /> Watch Demo
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>₦12.8M</span>
                <span className={styles.heroStatLbl}>Revenue Tracked Today</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>2,850+</span>
                <span className={styles.heroStatLbl}>Active SME Merchants</span>
              </div>
            </div>
          </div>

          {/* Hero Device Mockup */}
          <div className={styles.heroPreviewWrap}>
            <div className={`${styles.heroFloat} ${styles.heroFloatTR}`}>
              <div className={`${styles.floatIcon} ${styles.floatIconGreen}`}>🛒</div>
              <div>
                <div className={styles.floatStatVal}>+6 Orders</div>
                <div className={styles.floatStatLbl}>Last 14 minutes</div>
              </div>
            </div>

            <div className={`${styles.heroFloat} ${styles.heroFloatBL}`}>
              <div className={`${styles.floatIcon} ${styles.floatIconAmber}`}>💰</div>
              <div>
                <div className={styles.floatStatVal}>₦76,400</div>
                <div className="floatStatLbl">Today&apos;s Revenue</div>
              </div>
            </div>

            <div className={styles.heroDevice}>
              <div className={styles.deviceChrome}>
                <div className={styles.deviceDots}>
                  <div className={`${styles.dot} ${styles.dotRed}`} />
                  <div className={`${styles.dot} ${styles.dotYellow}`} />
                  <div className={`${styles.dot} ${styles.dotGreen}`} />
                </div>
                <div className={styles.deviceUrlBar}>app.solo.ng/dashboard</div>
                <div className={styles.deviceLiveBadge}>
                  <div className={styles.deviceLiveDot} /> LIVE
                </div>
              </div>
              <div className={styles.deviceBody}>
                <Image src="/images/northern-entrepreneur.png"
                  alt="SME Merchant Success"
                  width={1200}
                  height={800}
                  className={styles.dashboardHeroImg}
                  style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div className={styles.deviceOverlay} />
                <div className={styles.deviceStatsRow}>
                  <div className={styles.deviceMiniStat}><div className={styles.deviceMiniVal}>₦452k</div><div className={styles.deviceMiniLbl}>Sales</div></div>
                  <div className={styles.deviceMiniStat}><div className={styles.deviceMiniVal}>1,842</div><div className={styles.deviceMiniLbl}>Customers</div></div>
                  <div className={styles.deviceMiniStat}><div className={styles.deviceMiniVal}>128</div><div className={styles.deviceMiniLbl}>New Subs</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MerchantCounter />
      <TrustBar />

      {/* ── FEATURES ── */}
      <section id="features" className={styles.features}>
        <div className={styles.featuresInner}>
          <span className={styles.sectionLabel}>The Ecosystem</span>
          <h2 className={styles.sectionTitle}>Everything You Need to <em>Dominate.</em></h2>
          <p className={styles.sectionSubtitle}>
            Professional tools that work as hard as you do, built to scale with your ambition.
          </p>

          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ "--feature-color": f.color } as React.CSSProperties}>
                <div className={styles.featureIcon} style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
                <div className={styles.featureStat}>{f.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.featuresInner}>
          <span className={styles.sectionLabel}>Onboarding</span>
          <h2 className={styles.sectionTitle}>Built for Blazing Speed</h2>
          <p className={styles.sectionSubtitle}>Transition from social seller to global brand in minutes, not months.</p>

          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Connect Socials</h3>
              <p className={styles.stepDesc}>Link your Instagram or WhatsApp business profile to sync your products instantly.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>AI Generates Store</h3>
              <p className={styles.stepDesc}>Gemini builds your full product catalog and professional storefront automatically.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Receive Payments</h3>
              <p className={styles.stepDesc}>Accept local and international cards, manage logistics, and scale with AI tools.</p>
            </div>
          </div>
        </div>
      </section>

      <TestimonialSection />
      <PricingSection />
      <FAQSection />

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to Build Your Legacy?</h2>
          <p className={styles.ctaSubtitle}>Join the next generation of African merchants building on SOLO.</p>
          <Link href="/signup" className="btn btn-accent btn-lg">
            Create My Free Account <ArrowRight size={18} />
          </Link>
          <p className="mt-4 text-xs" style={{ opacity: .5 }}>Free for basic use. No credit card required.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footerEnhanced}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerLogo}>SOLO<span style={{ color: 'var(--primary)' }}>.</span></div>
            <p className={styles.footerTagline}>
              Empowering African SMEs with world-class, professional commerce infrastructure.
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
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>

          <div className={styles.footerCol}>
            <h4>Contact</h4>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)' }}>
              <p className="flex items-center gap-2 mb-2"><Mail size={14} /> support@solosme.com</p>
              <p className="flex items-center gap-2 mb-4"><Smartphone size={14} /> +234 803 925 4849</p>
              <p className="text-xs leading-relaxed opacity-60">
                <MapPin size={14} className="inline mr-1" />
                3. Ibrahim Coomassie Road,<br />
                GRA Ring Road Katsina,<br />
                Nigeria
              </p>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} SOLO SME. All rights reserved.</span>
          <span>🇳🇬 Built for the Nigerian Dream</span>
        </div>
      </footer>

      <WhatsAppButton />
      <ExitIntentPopup />
      <CookieConsent />
    </div >
  );
}
