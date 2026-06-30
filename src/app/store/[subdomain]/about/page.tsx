import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    MapPin, Mail, Phone, Clock, MessageCircle,
    Instagram, Facebook, Twitter, ExternalLink, Store, Heart, ShoppingBag, Tag
} from 'lucide-react';
import styles from '../store.module.css';
import { TenantService } from '@/services/tenantService';
import { ProductService } from '@/services/productService';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { subdomain } = await params;
    const supabase = await createClient();
    const tenant = await TenantService.getTenantBySubdomain(subdomain, supabase);

    if (!tenant) return { title: 'Store Not Found | SOLO' };

    const bc = tenant.business_config || {};
    const description = bc.about || tenant.store_description || tenant.description || `Learn more about ${tenant.name} — our story, locations, and how to reach us.`;

    return {
        title: `About ${tenant.name}`,
        description,
    };
}

/**
 * Build a smart fallback description using available tenant data.
 */
function buildFallbackDescription(tenantName: string, businessType?: string, productCategories?: string[]): string {
    const parts: string[] = [];

    if (businessType) {
        parts.push(`We are a ${businessType.toLowerCase()} business based in Nigeria.`);
    }

    if (productCategories && productCategories.length > 0) {
        const unique = [...new Set(productCategories)].slice(0, 4);
        if (unique.length === 1) {
            parts.push(`We specialize in ${unique[0].toLowerCase()} products.`);
        } else {
            const last = unique.pop();
            parts.push(`We offer ${unique.map(c => c.toLowerCase()).join(', ')} and ${last!.toLowerCase()} products.`);
        }
    }

    if (parts.length > 0) {
        return `Welcome to ${tenantName}. ${parts.join(' ')} We are passionate about delivering quality and exceptional service.`;
    }

    return `Welcome to ${tenantName}. We are passionate about delivering quality products and exceptional service.`;
}

export default async function AboutPage({ params }: PageProps) {
    const { subdomain } = await params;
    const supabase = await createClient();
    const tenant = await TenantService.getTenantBySubdomain(subdomain, supabase);

    if (!tenant) notFound();

    const bc = tenant.business_config || {};
    const whatsappClean = bc.whatsapp_number?.replace(/\D/g, '') || '';
    const hasContact = bc.email || bc.phone || bc.whatsapp_number;
    const hasSocial = bc.instagram_url || bc.facebook_url || bc.twitter_url || bc.tiktok_url;
    const hasAddress = bc.address;
    const hasBusinessHours = bc.business_hours;

    // Resolve logo from branding_config or top-level logo_url
    const logoUrl = tenant.branding_config?.logoUrl || tenant.logo_url;

    // Determine the about/description text
    const aboutText = bc.about || tenant.store_description || tenant.description;

    // Fetch product categories for smart fallback description
    let fallbackDescription = '';
    if (!aboutText) {
        let productCategories: string[] = [];
        try {
            const products = await ProductService.getProducts(tenant.id, supabase, { activeOnly: true, limit: 50 });
            productCategories = products
                .map(p => p.category)
                .filter((c): c is string => Boolean(c));
        } catch {
            // Products fetch is best-effort
        }
        fallbackDescription = buildFallbackDescription(tenant.name, bc.business_type, productCategories);
    }

    return (
        <div className={styles.aboutPage}>
            {/* Hero / Story Section */}
            <section className={styles.aboutHero}>
                <div className={styles.aboutHeroContent}>
                    {logoUrl ? (
                        <div className={styles.aboutHeroLogo}>
                            <Image
                                src={logoUrl}
                                alt={`${tenant.name} logo`}
                                width={80}
                                height={80}
                                className={styles.aboutLogoImage}
                            />
                        </div>
                    ) : (
                        <div className={styles.aboutIconBadge}>
                            <Store size={28} />
                        </div>
                    )}

                    <h1 className={styles.aboutTitle}>About {tenant.name}</h1>

                    {bc.business_type && (
                        <span className={styles.aboutBusinessTypeBadge}>
                            <Tag size={14} />
                            {bc.business_type}
                        </span>
                    )}

                    <p className={styles.aboutSubtitle}>
                        {aboutText || fallbackDescription}
                    </p>
                </div>
            </section>

            <div className={styles.aboutGrid}>
                {/* Contact Details Card */}
                {hasContact && (
                    <section className={styles.aboutCard}>
                        <div className={styles.aboutCardHeader}>
                            <Mail size={18} />
                            <h2>Get in Touch</h2>
                        </div>
                        <div className={styles.aboutCardBody}>
                            {bc.email && (
                                <a href={`mailto:${bc.email}`} className={styles.aboutContactRow}>
                                    <Mail size={16} />
                                    <span>{bc.email}</span>
                                </a>
                            )}
                            {bc.phone && (
                                <a href={`tel:${bc.phone}`} className={styles.aboutContactRow}>
                                    <Phone size={16} />
                                    <span>{bc.phone}</span>
                                </a>
                            )}
                            {bc.whatsapp_number && (
                                <a
                                    href={`https://wa.me/${whatsappClean}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.aboutContactRow}
                                >
                                    <MessageCircle size={16} />
                                    <span>{bc.whatsapp_number}</span>
                                </a>
                            )}
                        </div>

                        {/* WhatsApp CTA */}
                        {bc.whatsapp_number && (
                            <a
                                href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(`Hi ${tenant.name}, I'd like to know more about your products!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.aboutWhatsappCta}
                            >
                                <MessageCircle size={18} />
                                Chat with us on WhatsApp
                            </a>
                        )}
                    </section>
                )}

                {/* Address / Locations Card */}
                {hasAddress && (
                    <section className={styles.aboutCard}>
                        <div className={styles.aboutCardHeader}>
                            <MapPin size={18} />
                            <h2>Visit Us</h2>
                        </div>
                        <div className={styles.aboutCardBody}>
                            <div className={styles.aboutLocationItem}>
                                <MapPin size={16} className={styles.aboutLocationIcon} />
                                <div>
                                    <p className={styles.aboutLocationAddress}>{bc.address}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Business Hours Card */}
                {hasBusinessHours && (
                    <section className={styles.aboutCard}>
                        <div className={styles.aboutCardHeader}>
                            <Clock size={18} />
                            <h2>Business Hours</h2>
                        </div>
                        <div className={styles.aboutCardBody}>
                            <div className={styles.aboutLocationItem}>
                                <Clock size={16} className={styles.aboutLocationIcon} />
                                <div>
                                    <p className={styles.aboutLocationAddress}>{bc.business_hours}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Social Media Card */}
                {hasSocial && (
                    <section className={styles.aboutCard}>
                        <div className={styles.aboutCardHeader}>
                            <Heart size={18} />
                            <h2>Follow Us</h2>
                        </div>
                        <div className={styles.aboutSocialGrid}>
                            {bc.instagram_url && (
                                <a
                                    href={bc.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.aboutSocialLink}
                                >
                                    <Instagram size={20} />
                                    <span>Instagram</span>
                                    <ExternalLink size={14} />
                                </a>
                            )}
                            {bc.facebook_url && (
                                <a
                                    href={bc.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.aboutSocialLink}
                                >
                                    <Facebook size={20} />
                                    <span>Facebook</span>
                                    <ExternalLink size={14} />
                                </a>
                            )}
                            {bc.twitter_url && (
                                <a
                                    href={bc.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.aboutSocialLink}
                                >
                                    <Twitter size={20} />
                                    <span>X / Twitter</span>
                                    <ExternalLink size={14} />
                                </a>
                            )}
                            {bc.tiktok_url && (
                                <a
                                    href={bc.tiktok_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.aboutSocialLink}
                                >
                                    <ExternalLink size={20} />
                                    <span>TikTok</span>
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>

                        {bc.whatsapp_number && (
                            <a
                                href={`https://wa.me/${whatsappClean}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.aboutSocialLink}
                                style={{ marginTop: '8px' }}
                            >
                                <MessageCircle size={20} />
                                <span>WhatsApp</span>
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </section>
                )}
            </div>

            {/* Fallback when no data at all */}
            {!hasContact && !hasAddress && !hasSocial && !hasBusinessHours && (
                <div className={styles.aboutEmptyState}>
                    <Store size={48} />
                    <h3>More info coming soon</h3>
                    <p>
                        We are still setting up our page. Check back soon for contact details,
                        business hours, and more about {tenant.name}.
                    </p>
                    <div className={styles.aboutEmptyActions}>
                        <Link href={`/store/${subdomain}`} className="btn btn-primary">
                            <ShoppingBag size={16} />
                            Shop Now
                        </Link>
                        <Link href={`/store/${subdomain}`} className="btn btn-secondary">
                            Browse Our Shop
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
