import { Metadata } from 'next';
import Link from 'next/link';
import {
    MapPin, Mail, Phone, Clock, MessageCircle,
    Instagram, Facebook, Twitter, ExternalLink, Store, Users, Heart
} from 'lucide-react';
import styles from '../store.module.css';
import { TenantService } from '@/services/tenantService';
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

    return {
        title: `About ${tenant.name} | SOLO SME`,
        description: tenant.description || `Learn more about ${tenant.name} — our story, locations, and how to reach us.`,
    };
}

export default async function AboutPage({ params }: PageProps) {
    const { subdomain } = await params;
    const supabase = await createClient();
    const tenant = await TenantService.getTenantBySubdomain(subdomain, supabase);

    if (!tenant) notFound();

    const bc = tenant.business_config || {};
    const description = tenant.description || bc.address ? undefined : null;
    const whatsappClean = bc.whatsapp_number?.replace(/\D/g, '') || '';
    const hasContact = bc.email || bc.phone || bc.whatsapp_number;
    const hasSocial = bc.instagram_url || bc.facebook_url || bc.twitter_url || bc.tiktok_url;
    const hasAddress = bc.address;

    return (
        <div className={styles.aboutPage}>
            {/* Hero / Story Section */}
            <section className={styles.aboutHero}>
                <div className={styles.aboutHeroContent}>
                    <div className={styles.aboutIconBadge}>
                        <Store size={28} />
                    </div>
                    <h1 className={styles.aboutTitle}>About {tenant.name}</h1>
                    {tenant.description && (
                        <p className={styles.aboutSubtitle}>{tenant.description}</p>
                    )}
                    {!tenant.description && (
                        <p className={styles.aboutSubtitle}>
                            Welcome to {tenant.name}. We are passionate about delivering quality products and exceptional service to our customers.
                        </p>
                    )}
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
            {!hasContact && !hasAddress && !hasSocial && (
                <div className={styles.aboutEmptyState}>
                    <Store size={48} />
                    <h3>More info coming soon</h3>
                    <p>
                        We are still setting up our page. Check back soon for contact details,
                        business hours, and more about {tenant.name}.
                    </p>
                    <Link href={`/store/${subdomain}`} className="btn btn-primary">
                        Browse Our Shop
                    </Link>
                </div>
            )}
        </div>
    );
}
