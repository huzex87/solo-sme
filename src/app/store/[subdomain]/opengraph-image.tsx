import { ImageResponse } from 'next/og';
import { TenantService } from '@/services/tenantService';
import { createClient } from '@/lib/supabase/server';
import { resolveStoreTheme } from '@/lib/storefront/theme';
import type { Tenant } from '@/types';

// Dynamic Open Graph card for each storefront — branded with the store's name,
// tagline and colour so shared links look intentional on WhatsApp/social.
export const runtime = 'nodejs';
export const alt = 'Storefront on SOLO SME';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const clamp = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

export default async function OgImage({ params }: { params: Promise<{ subdomain: string }> }) {
    const { subdomain } = await params;

    let name = 'SOLO SME Store';
    let tagline = 'Shop quality products online.';
    let primary = '#0A7B6C';
    let accent = '#F5A623';

    try {
        const supabase = await createClient();
        const tenant = await TenantService.getTenantBySubdomain(subdomain, supabase);
        if (tenant) {
            const theme = resolveStoreTheme(tenant as unknown as Tenant);
            primary = theme.primary || primary;
            accent = theme.accent || accent;
            name = clamp(tenant.name || name, 42);
            tagline = clamp(
                tenant.store_description || tenant.description || theme.preset.hero.subtitle,
                110
            );
        }
    } catch {
        // fall back to the generic SOLO card
    }

    const initial = (name || 'S').charAt(0).toUpperCase();

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px',
                    background: `linear-gradient(135deg, ${primary} 0%, #0b1512 100%)`,
                    color: '#ffffff',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* top: logo badge + store name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                    <div
                        style={{
                            width: '108px',
                            height: '108px',
                            borderRadius: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.14)',
                            border: `4px solid ${accent}`,
                            fontSize: '58px',
                            fontWeight: 800,
                        }}
                    >
                        {initial}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '22px',
                            letterSpacing: '4px',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.72)',
                        }}
                    >
                        Online Store
                    </div>
                </div>

                {/* middle: name + tagline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', fontSize: '84px', fontWeight: 800, lineHeight: 1.05 }}>
                        {name}
                    </div>
                    <div style={{ display: 'flex', fontSize: '32px', color: 'rgba(255,255,255,0.82)', maxWidth: '900px' }}>
                        {tagline}
                    </div>
                </div>

                {/* bottom: accent rule + powered by */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', height: '10px', width: '160px', borderRadius: '999px', background: accent }} />
                    <div style={{ display: 'flex', fontSize: '24px', color: 'rgba(255,255,255,0.7)' }}>
                        Powered by SOLO SME
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
