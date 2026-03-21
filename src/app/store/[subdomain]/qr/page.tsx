import { notFound } from 'next/navigation';
import { TenantService } from '@/services/tenantService';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../store.module.css';
import { QRPageClient } from './QRPageClient';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
    const { subdomain } = await params;
    const tenant = await TenantService.getTenantBySubdomain(subdomain);

    if (!tenant) return { title: 'Store Not Found | SOLO' };

    return {
        title: `QR Codes | ${tenant.name}`,
        description: `Download and print QR codes for ${tenant.name}. Share your store link instantly.`,
    };
}

export default async function StoreQRPage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const tenant = await TenantService.getTenantBySubdomain(subdomain);

    if (!tenant) notFound();

    const logoUrl = tenant.branding_config?.logoUrl || tenant.logo_url;
    const primaryColor = tenant.branding_config?.primaryColor;
    const whatsappNumber = tenant.business_config?.whatsapp_number || tenant.whatsapp_phone;

    return (
        <div className={styles.qrPage}>
            <div className={styles.qrPageHeader}>
                <Link href={`/store/${subdomain}`} className={styles.qrBackLink}>
                    &larr; Back to Store
                </Link>

                <div className={styles.qrPageBranding}>
                    {logoUrl && (
                        <Image
                            src={logoUrl}
                            alt={tenant.name}
                            width={56}
                            height={56}
                            className={styles.qrPageLogo}
                        />
                    )}
                    <div>
                        <h1 className={styles.qrPageTitle}>{tenant.name}</h1>
                        <p className={styles.qrPageSubtitle}>QR Codes for your business</p>
                    </div>
                </div>
            </div>

            <QRPageClient
                storeName={tenant.name}
                subdomain={subdomain}
                logoUrl={logoUrl}
                primaryColor={primaryColor}
                whatsappNumber={whatsappNumber}
            />
        </div>
    );
}
