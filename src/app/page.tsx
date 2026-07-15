'use client';

import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Bot,
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
import { BrandLogo } from '@/components/shared/BrandLogo';

const landingTranslations = {
  en: {
    features: "Features",
    how_it_works: "How It Works",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Login",
    get_started: "Get Started",
    hero_eyebrow: "AI-POWERED OMNI-COMMERCE",
    hero_title: "The AI commerce engine for African merchants",
    hero_subtitle: "Set up your online storefront and start accepting card or bank transfer payments in under 2 minutes. Automate inventory, invoicing, and customer care directly via WhatsApp. Zero setup fees.",
    start_free_store: "Start My Free Store",
    see_how: "See How It Works",
    setup_time: "2 Min",
    setup_lbl: "Store Setup",
    no_skills: "Zero",
    no_skills_lbl: "Technical Skills Needed",
    orders_last: "+6 Orders",
    orders_time: "Last 14 minutes",
    today_revenue: "Today's Revenue",
    ecosystem: "The Ecosystem",
    eco_title: "Everything you need to grow your business",
    eco_subtitle: "Simple, powerful tools designed to help you sell more and manage orders with zero stress.",
    onboarding: "Onboarding",
    speed_title: "Built for Blazing Speed",
    speed_sub: "Transition from social seller to professional brand in 3 simple steps.",
    custom_domain_feature: "Custom Domain Included",
    step1_title: "1. Claim Your Link",
    step1_desc: "Sign up and grab your custom shop link (e.g., yourname.solosme.ng) in seconds. No technical skills required.",
    step2_title: "2. Chat with AI on WhatsApp",
    step2_desc: "Connect on WhatsApp. Send pictures and descriptions of your products to our AI assistant to instantly build your catalog.",
    step3_title: "3. Share & Get Paid",
    step3_desc: "Share your shop link on Instagram and WhatsApp. Customers check out easily, and payments go directly to you.",
    cta_title: "Ready to grow your business?",
    cta_sub: "Join thousands of Nigerian merchants building their online presence on SOLO.",
    cta_btn: "Create My Free Account",
    cta_note: "Free for basic use. No credit card required.",
    footer_desc: "Empowering Nigerian businesses with simple, professional commerce tools.",
    footer_bottom: "🇳🇬 Built for the Nigerian Dream"
  },
  ha: {
    features: "Abubuwa",
    how_it_works: "Yadda Yake Aiki",
    pricing: "Farashi",
    faq: "Tambayoyi",
    login: "Shiga",
    get_started: "Fara Amfani",
    hero_eyebrow: "KASUWANCI MAI AMFANI DA AI",
    hero_title: "Tsarin kasuwanci mai ƙarfin AI don 'yan kasuwa",
    hero_subtitle: "Saita shagonka na intanet kuma ka fara karɓar tura kudi ko katin banki a ƙasa da mintuna 2. Sarrafa kaya, daftari, da sabis ɗin abokan ciniki kai tsaye ta WhatsApp. Babu kuɗin saita shago.",
    start_free_store: "Buɗe Shagona Kyauta",
    see_how: "Duba Yadda Yake Aiki",
    setup_time: "Minti 2",
    setup_lbl: "Buɗe Shago",
    no_skills: "Babu",
    no_skills_lbl: "Bukatar Ilimin Kwamfuta",
    orders_last: "+6 Ododi",
    orders_time: "Cikin mintuna 14 da suka wuce",
    today_revenue: "Kuɗin Shiga na Yau",
    ecosystem: "Tsarin Shago",
    eco_title: "Kayan aiki don bunƙasa kasuwancinka",
    eco_subtitle: "Kayan aiki masu sauƙi da ƙarfi waɗanda aka tsara don taimaka maka siyarwa da sarrafa ododi cikin kwanciyar kantali.",
    onboarding: "Matakan Fara Amfani",
    speed_title: "An gina shi don sauri sosai",
    speed_sub: "Sauya daga siyarwa a social media zuwa babban shago cikin matakai 3 masu sauƙi.",
    custom_domain_feature: "Hade da Custom Domain",
    step1_title: "1. Karɓi Adireshin Shago",
    step1_desc: "Yi rajista kuma ka karɓi adireshin shagonka na musamman (kamar sunanka.solosme.ng) cikin daƙiƙa kaɗan.",
    step2_title: "2. Yi magana da AI a WhatsApp",
    step2_desc: "Haɗa da WhatsApp. Tura hotuna da bayanan kayanka zuwa ga mataimakinmu na AI don ƙirƙirar jerin kayanka cikin sauri.",
    step3_title: "3. Raba Link & Karɓi Kuɗi",
    step3_desc: "Raba adireshin shagonka a Instagram da WhatsApp. Abokan ciniki zasu biya cikin sauƙi, kuma kuɗin zasu shigo gare ka kai tsaye.",
    cta_title: "Shirye kake don bunƙasa kasuwancinka?",
    cta_sub: "Kasance tare da dubban 'yan kasuwa na Najeriya da ke gina shagunansu a intanet da SOLO.",
    cta_btn: "Ƙirƙiri Shagona Kyauta",
    cta_note: "Kyauta ne don amfani na yau da kullum. Babu buƙatar kati.",
    footer_desc: "Taimaka wa kasuwancin Najeriya da kayan aikin kasuwanci masu sauƙi da inganci.",
    footer_bottom: "🇳🇬 An gina shi don Mafarkin Najeriya"
  }
};

const getLocalizedFeatures = (lang: 'en' | 'ha') => [
  {
    icon: <Bot size={20} />,
    title: lang === 'en' ? 'WhatsApp Sales Assistant' : 'Mataimakin Talla na WhatsApp',
    desc: lang === 'en' 
      ? 'Manage your entire store from WhatsApp. Upload products, check orders, and engage customers easily.'
      : 'Sarrafa dukkan shagonka daga WhatsApp. Saka kaya, duba ododi, kuma kayi magana da abokan ciniki cikin sauƙi.',
    color: '#00798C',
    stat: lang === 'en' ? '90% faster management' : 'Gudanarwa da sauri da kashi 90%',
  },
  {
    icon: <Sparkles size={20} />,
    title: lang === 'en' ? 'Gemini AI Cataloguing' : 'Tsara Kaya da Gemini AI',
    desc: lang === 'en'
      ? 'Simply upload a photo. Our AI instantly writes professional descriptions and categorizes products.'
      : 'Tura hoto kawai. AI ɗinmu zai rubuta cikakken bayanin kaya kuma ya tsara rukuni nan da nan.',
    color: '#ec4899',
    stat: lang === 'en' ? 'Instant product launches' : 'Fitar da kaya take yanzu',
  },
  {
    icon: <BarChart3 size={20} />,
    title: lang === 'en' ? 'Growth Intelligence' : 'Nazarin Bunƙasa Shago',
    desc: lang === 'en'
      ? 'SOLO analyzes your sales patterns to help you predict demand and set optimal prices.'
      : 'SOLO yana nazarin siyarwar ku don taimaka muku sanin buƙatun kasuwa da sanya farashi mai kyau.',
    color: '#10b981',
    stat: lang === 'en' ? 'Data-backed decisions' : 'Shawara bisa ga bayanai',
  },
  {
    icon: <Layout size={20} />,
    title: lang === 'en' ? 'Sovereign Storefronts' : 'Ingantattun Shaguna',
    desc: lang === 'en'
      ? 'Beautiful, professional designs that make your brand look premium on any screen.'
      : 'Kyawawan tsari na zamani waɗanda zasu sa shagonka ya zama mai kyau a kowane waya ko kwamfuta.',
    color: '#f59e0b',
    stat: lang === 'en' ? 'Built for trust' : 'An gina shi don amincewa',
  },
  {
    icon: <Shield size={20} />,
    title: lang === 'en' ? 'Secured by Supabase' : 'Kariya dari Supabase',
    desc: lang === 'en'
      ? 'Bank-level security for your transactions. Fully encrypted and secure payment routing.'
      : 'Kariya mai ƙarfi kamar ta banki don kasuwancin ku. Cikakken tsaro na musayar bayanai.',
    color: '#3b82f6',
    stat: lang === 'en' ? 'Enterprise-grade security' : 'Kariya matakin kamfanoni',
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: lang === 'en' ? 'One-Click Checkout' : 'Biyan kuɗi da sauri',
    desc: lang === 'en'
      ? 'Accept bank transfers, cards, and USSD easily. Built-in seamless checkout flow.'
      : 'Karɓi tura kudi ta banki, katunan kuɗi, da USSD cikin sauƙi. Hanyar biya mai sauƙin gaske.',
    color: '#00798C',
    stat: lang === 'en' ? 'Highest success rates' : 'Biyan kuɗi cikin nasara',
  }
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'ha'>('en');

  const t = (key: keyof typeof landingTranslations.en) => landingTranslations[lang][key];
  const features = getLocalizedFeatures(lang);

  return (
    <div className={styles.landing}>
      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <Link href="/" className="transition-transform active:scale-95">
          <BrandLogo variant="monochrome-white" size={32} />
        </Link>

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
          <Link href="#features">{t("features")}</Link>
          <Link href="#how-it-works">{t("how_it_works")}</Link>
          <Link href="#pricing">{t("pricing")}</Link>
          <Link href="#faq">{t("faq")}</Link>
        </div>

        <div className={styles.navCTAGroup}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'en' | 'ha')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '4px 8px',
              outline: 'none',
              cursor: 'pointer',
              marginRight: '0.75rem'
            }}
          >
            <option value="en" style={{ background: '#0a192f', color: '#fff' }}>EN</option>
            <option value="ha" style={{ background: '#0a192f', color: '#fff' }}>HA</option>
          </select>

          <Link href="/login" className={styles.navLoginBtn}>{t("login")}</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">{t("get_started")}</Link>
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
              {t("hero_eyebrow")}
            </div>

            <h1 className={styles.heroTitle}>
              {t("hero_title")}
            </h1>

            <p className={styles.heroSubtitle}>
              {t("hero_subtitle")}
            </p>

            <div className={styles.heroCTA}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                {t("start_free_store")} <ArrowRight size={16} />
              </Link>
              <Link href="#how-it-works" className="btn btn-ghost btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.15)' }}>
                {t("see_how")}
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>{t("setup_time")}</span>
                <span className={styles.heroStatLbl}>{t("setup_lbl")}</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>{t("no_skills")}</span>
                <span className={styles.heroStatLbl}>{t("no_skills_lbl")}</span>
              </div>
            </div>
          </div>

          {/* Hero Preview */}
          <div className={styles.heroPreviewWrap}>
            <div className={`${styles.heroFloat} ${styles.heroFloatTR}`}>
              <div className={`${styles.floatIcon} ${styles.floatIconGreen}`}>🛒</div>
              <div>
                <div className={styles.floatStatVal}>{t("orders_last")}</div>
                <div className={styles.floatStatLbl}>{t("orders_time")}</div>
              </div>
            </div>

            <div className={`${styles.heroFloat} ${styles.heroFloatBL}`}>
              <div className={`${styles.floatIcon} ${styles.floatIconAmber}`}>💰</div>
              <div>
                <div className={styles.floatStatVal}>₦76,400</div>
                <div className="floatStatLbl">{t("today_revenue")}</div>
              </div>
            </div>

            <div className={styles.heroDevice}>
              <div className={styles.deviceChrome}>
                <div className={styles.deviceDots}>
                  <div className={`${styles.dot} ${styles.dotRed}`} />
                  <div className={`${styles.dot} ${styles.dotYellow}`} />
                  <div className={`${styles.dot} ${styles.dotGreen}`} />
                </div>
                <div className={styles.deviceUrlBar}>app.solosme.ng/dashboard</div>
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
          <span className={styles.sectionLabel}>{t("ecosystem")}</span>
          <h2 className={styles.sectionTitle}>
            {lang === 'en' ? (
              <>Everything you need to <em>grow your business</em></>
            ) : (
              <>Kayan aiki don <em>bunƙasa kasuwancinka</em></>
            )}
          </h2>
          <p className={styles.sectionSubtitle}>
            {t("eco_subtitle")}
          </p>

          <div className={styles.featureGrid}>
            {features.map((f, i) => (
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
          <span className={styles.sectionLabel}>{t("onboarding")}</span>
          <h2 className={styles.sectionTitle}>{t("speed_title")}</h2>
          <p className={styles.sectionSubtitle}>{t("speed_sub")}</p>

          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>{t("step1_title")}</h3>
              <p className={styles.stepDesc}>{t("step1_desc")}</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>{t("step2_title")}</h3>
              <p className={styles.stepDesc}>{t("step2_desc")}</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>{t("step3_title")}</h3>
              <p className={styles.stepDesc}>{t("step3_desc")}</p>
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
          <h2 className={styles.ctaTitle}>{t("cta_title")}</h2>
          <p className={styles.ctaSubtitle}>{t("cta_sub")}</p>
          <Link href="/signup" className="btn btn-accent btn-lg">
            {t("cta_btn")} <ArrowRight size={18} />
          </Link>
          <p className="mt-4 text-xs" style={{ opacity: .5 }}>{t("cta_note")}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footerEnhanced}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrandCol}>
            <BrandLogo variant="monochrome-white" size={40} className="mb-6" />
            <p className={styles.footerTagline}>
              {t("footer_desc")}
            </p>
            <div className={styles.footerSocials}>
              <Link href="#" className={styles.footerSocialLink} aria-label="Instagram"><Instagram size={18} /></Link>
              <Link href="#" className={styles.footerSocialLink} aria-label="Facebook"><Facebook size={18} /></Link>
              <Link href="#" className={styles.footerSocialLink} aria-label="Twitter"><Twitter size={18} /></Link>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Platform</h4>
            <Link href="#features">{t("features")}</Link>
            <Link href="/store">Marketplace</Link>
            <Link href="#pricing">{t("pricing")}</Link>
            <Link href="/signup">{t("get_started")}</Link>
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
              <p className="flex items-center gap-2 mb-2"><Mail size={14} /> hello@solosme.ng</p>
              <p className="flex items-center gap-2 mb-4"><Smartphone size={14} /> +234 813 55 4493</p>

              <p className="text-xs leading-relaxed opacity-60">
                <MapPin size={14} className="inline mr-1" />
                No 3. Ibrahim Coomassie Road,<br />
                GRA Katsina State,<br />
                Nigeria
              </p>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} SOLO SME. All rights reserved.</span>
          <span>{t("footer_bottom")}</span>
        </div>
      </footer>

      <WhatsAppButton />
      <ExitIntentPopup />
      <CookieConsent />
    </div>
  );
}
