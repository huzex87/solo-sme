import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import styles from '@/app/store/[subdomain]/store.module.css';
import { CurrencyService } from '@/services/currencyService';
import type { SectorPreset } from '@/lib/storefront/sectors';
import type { StoreFounder } from '@/lib/storefront/theme';

/** Inline feature-strip icons keyed by the sector preset's `icon` field. */
export function FeatureIcon({ name, size = 20 }: { name: string; size?: number }) {
    const common = {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    };
    switch (name) {
        case 'truck': return (<svg {...common}><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>);
        case 'chat': return (<svg {...common}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>);
        case 'flame': return (<svg {...common}><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C8 9 12 8 12 2z" /><path d="M8.5 14a3.5 3.5 0 0 0 7 0" /></svg>);
        case 'clock': return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
        case 'leaf': return (<svg {...common}><path d="M11 20A7 7 0 0 1 4 13c0-6 8-9 16-9 0 8-3 16-9 16z" /><path d="M11 20c0-5 2-9 7-11" /></svg>);
        case 'spark': return (<svg {...common}><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /></svg>);
        case 'shield': return (<svg {...common}><path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5z" /></svg>);
        case 'check':
        default: return (<svg {...common}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></svg>);
    }
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
    return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.01c-.25.7-1.44 1.33-1.98 1.38-.53.05-.53.42-3.34-.7-2.8-1.12-4.6-3.97-4.74-4.15-.14-.19-1.13-1.5-1.13-2.87 0-1.36.72-2.03.97-2.31.25-.28.54-.35.72-.35.18 0 .36 0 .52.01.17.01.39-.06.61.47.25.6.83 2.06.9 2.21.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.28.28-.12.56.16.28.7 1.16 1.51 1.88 1.04.93 1.92 1.22 2.2 1.36.28.14.44.12.6-.07.16-.19.7-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.6.75 1.87.89.28.14.46.21.53.32.07.12.07.66-.18 1.35z" /></svg>);
}

interface HeroProduct {
    id: string;
    name: string;
    price: number | null;
    image_url?: string | null;
    category?: string | null;
}

interface HeroProps {
    preset: SectorPreset;
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaText: string;
    shopHref: string;
    whatsappUrl?: string | null;
    windowProducts: HeroProduct[];
    currency: string;
    subdomain: string;
}

/**
 * "Shopfront window" hero — headline and CTAs on the left, a live stack of the
 * store's own products on the right, so the goods sell at first glance. Falls
 * back to a clean centered hero when the store has no products yet.
 */
export function StoreHero({
    preset, eyebrow, title, subtitle, ctaText, shopHref, whatsappUrl, windowProducts, currency, subdomain,
}: HeroProps) {
    const priceOf = (p: HeroProduct) =>
        CurrencyService.format(CurrencyService.convert(p.price || 0, 'NGN', currency), currency);

    const tiles = windowProducts.slice(0, 3);
    const hasWindow = tiles.length >= 3;

    // Emphasise the last word or two of the headline in the brand colour.
    const words = title.trim().split(' ');
    const emStart = Math.max(1, words.length - 2);
    const lead = words.slice(0, emStart).join(' ');
    const em = words.slice(emStart).join(' ');

    return (
        <section className={`${styles.hero} ${hasWindow ? styles.heroSplit : ''}`}>
            <div className={styles.heroCopy}>
                <span className={styles.heroEyebrow}>{eyebrow}</span>
                <h1 className={styles.heroTitle}>
                    {lead} {em && <em className={styles.heroEm}>{em}</em>}
                </h1>
                <p className={styles.heroSubtitle}>{subtitle}</p>
                <div className={styles.heroCtas}>
                    <Link href={shopHref} className={`btn btn-primary ${styles.heroBtn}`}>
                        <ShoppingCart size={18} /> {ctaText}
                    </Link>
                    {whatsappUrl && (
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.heroWaBtn}>
                            <WhatsAppIcon /> Order on WhatsApp
                        </a>
                    )}
                </div>
                <div className={styles.heroTrust}>
                    {preset.features.map((f, i) => (
                        <span key={i} className={styles.heroTrustItem}>
                            <FeatureIcon name={f.icon} size={15} /> {f.title}
                        </span>
                    ))}
                </div>
            </div>

            {hasWindow && (
                <div className={styles.heroWindow}>
                    {tiles.map((p, i) => (
                        <Link
                            key={p.id}
                            href={`/store/${subdomain}/product/${p.id}`}
                            className={`${styles.winTile} ${i === 0 ? styles.winTall : ''}`}
                        >
                            {p.image_url ? (
                                <Image src={p.image_url} alt={p.name} fill sizes="(max-width:900px) 100vw, 40vw" style={{ objectFit: 'cover' }} />
                            ) : (
                                <span className={styles.winPh} aria-hidden="true" />
                            )}
                            <span className={styles.winCap}>
                                <span className={styles.winName}>{p.name}</span>
                                <span className={styles.winPrice}>{priceOf(p)}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

/** Founder / CEO section — renders only when the merchant has filled it in. */
export function FounderSection({ founder }: { founder: StoreFounder }) {
    const initials = (founder.name || 'F')
        .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <section className={styles.founder}>
            <div className={styles.founderCard}>
                <div className={styles.founderPortrait}>
                    {founder.photo ? (
                        <Image src={founder.photo} alt={founder.name || 'Founder'} fill sizes="(max-width:900px) 60vw, 300px" style={{ objectFit: 'cover' }} />
                    ) : (
                        <span className={styles.founderInitials} aria-hidden="true">{initials}</span>
                    )}
                    <span className={styles.founderBadge}>{founder.role || 'Founder'}</span>
                </div>
                <div className={styles.founderCopy}>
                    <span className={styles.heroEyebrow}>Meet the founder</span>
                    {founder.quote && <p className={styles.founderQuote}>{founder.quote}</p>}
                    {founder.message && <p className={styles.founderMsg}>{founder.message}</p>}
                    {founder.name && (
                        <div className={styles.founderSig}>
                            <span className={styles.founderName}>{founder.name}</span>
                            {founder.role && <span className={styles.founderRole}>{founder.role}</span>}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
