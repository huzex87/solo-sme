/**
 * Sector-adaptive storefront presets.
 *
 * A storefront's personality — palette, display font, hero copy, card shape and
 * feature set — adapts to the merchant's business type. These presets are smart
 * DEFAULTS: anything the merchant sets explicitly (brand colour, hero text,
 * feature cards) always wins over the preset. Colour resolution itself lives in
 * ./theme.ts; this module owns the sector vocabulary.
 */

export type SectorKey = 'fashion' | 'food' | 'beauty' | 'home' | 'services' | 'default';

export interface SectorPreset {
    key: SectorKey;
    label: string;
    /** Brand palette used only when the merchant has no colour of their own. */
    palette: { primary: string; accent: string };
    /** Display typeface for headings (must be loaded by the storefront layout). */
    display: string;
    /** Product image aspect ratio, e.g. '4 / 5' (portrait) or '1 / 1' (square). */
    cardRatio: string;
    hero: {
        eyebrow: string;
        /** Headline is rendered as: "<lead> <em>emphasis</em>". */
        titleLead: string;
        titleEmphasis: string;
        subtitle: string;
        cta: string;
    };
    /** Trust/feature strip. `icon` maps to a key in storefront FeatureIcon. */
    features: Array<{ icon: string; title: string; description: string }>;
    catalogEyebrow: string;
    catalogTitle: string;
}

export const SECTOR_PRESETS: Record<SectorKey, SectorPreset> = {
    fashion: {
        key: 'fashion',
        label: 'Fashion & Lifestyle',
        palette: { primary: '#0A7B6C', accent: '#F5A623' },
        display: 'var(--font-bricolage)',
        cardRatio: '4 / 5',
        hero: {
            eyebrow: 'The collection',
            titleLead: 'Style that',
            titleEmphasis: 'speaks for you.',
            subtitle: 'Browse the latest pieces and shop securely — delivered to your door across Nigeria.',
            cta: 'Shop the collection',
        },
        features: [
            { icon: 'check', title: 'Verified quality', description: 'Every piece reviewed before it is listed.' },
            { icon: 'truck', title: 'Nationwide delivery', description: 'Shipping to all 36 states, tracked.' },
            { icon: 'chat', title: 'Order on WhatsApp', description: 'Reach us any time — we reply fast.' },
        ],
        catalogEyebrow: 'The collection',
        catalogTitle: 'Shop everything',
    },
    food: {
        key: 'food',
        label: 'Food & Restaurant',
        palette: { primary: '#C63D2E', accent: '#F0A417' },
        display: 'var(--font-bricolage)',
        cardRatio: '1 / 1',
        hero: {
            eyebrow: "Today's menu",
            titleLead: 'Hot, homemade,',
            titleEmphasis: 'delivered fast.',
            subtitle: 'Freshly cooked meals made to order. Browse the menu and get it delivered, or order on WhatsApp.',
            cta: 'See the menu',
        },
        features: [
            { icon: 'flame', title: 'Cooked to order', description: 'Made fresh — never frozen, never reheated.' },
            { icon: 'clock', title: 'Same-day delivery', description: 'Order early, eat on time.' },
            { icon: 'chat', title: 'Order on WhatsApp', description: 'Send your order, we confirm in minutes.' },
        ],
        catalogEyebrow: "Today's menu",
        catalogTitle: 'On the menu',
    },
    beauty: {
        key: 'beauty',
        label: 'Beauty & Skincare',
        palette: { primary: '#9B4A73', accent: '#D9A441' },
        display: 'var(--font-fraunces)',
        cardRatio: '4 / 5',
        hero: {
            eyebrow: 'The ritual',
            titleLead: 'Care that',
            titleEmphasis: 'glows back.',
            subtitle: 'Thoughtfully made beauty and skincare, formulated for you. Shop securely or ask us for advice.',
            cta: 'Shop the range',
        },
        features: [
            { icon: 'leaf', title: 'Clean ingredients', description: 'Honest formulas, kind to your skin.' },
            { icon: 'spark', title: 'Made for you', description: 'Formulated for melanin-rich skin.' },
            { icon: 'chat', title: 'Beauty advice', description: 'Chat with us to build your routine.' },
        ],
        catalogEyebrow: 'The ritual',
        catalogTitle: 'Shop the range',
    },
    home: {
        key: 'home',
        label: 'Home & Electronics',
        palette: { primary: '#2F6E8F', accent: '#E0873B' },
        display: 'var(--font-bricolage)',
        cardRatio: '1 / 1',
        hero: {
            eyebrow: 'The catalogue',
            titleLead: 'Upgrade your',
            titleEmphasis: 'everyday.',
            subtitle: 'Genuine home and tech essentials that last — warranty-backed and delivered across Nigeria.',
            cta: 'Shop everything',
        },
        features: [
            { icon: 'shield', title: 'Genuine & warranted', description: 'Authentic stock, cover on every item.' },
            { icon: 'truck', title: 'Fast dispatch', description: 'Ships quickly, tracked to your door.' },
            { icon: 'chat', title: 'Buying help', description: 'Ask us anything before you buy.' },
        ],
        catalogEyebrow: 'The catalogue',
        catalogTitle: 'Shop everything',
    },
    services: {
        key: 'services',
        label: 'Services',
        palette: { primary: '#0A7B6C', accent: '#F5A623' },
        display: 'var(--font-bricolage)',
        cardRatio: '4 / 5',
        hero: {
            eyebrow: 'What we offer',
            titleLead: 'Work with',
            titleEmphasis: 'people who care.',
            subtitle: 'Explore our services and book with confidence. Reach out any time on WhatsApp.',
            cta: 'View services',
        },
        features: [
            { icon: 'check', title: 'Trusted work', description: 'Quality you can count on.' },
            { icon: 'clock', title: 'On schedule', description: 'We show up and deliver on time.' },
            { icon: 'chat', title: 'Talk to us', description: 'Questions? Message us on WhatsApp.' },
        ],
        catalogEyebrow: 'What we offer',
        catalogTitle: 'Our services',
    },
    default: {
        key: 'default',
        label: 'General',
        palette: { primary: '#0A7B6C', accent: '#F5A623' },
        display: 'var(--font-bricolage)',
        cardRatio: '4 / 5',
        hero: {
            eyebrow: 'Welcome',
            titleLead: 'Quality you can',
            titleEmphasis: 'shop with confidence.',
            subtitle: 'Browse our products and check out securely, or order directly on WhatsApp.',
            cta: 'Shop now',
        },
        features: [
            { icon: 'check', title: 'Verified quality', description: 'Every product reviewed before listing.' },
            { icon: 'truck', title: 'Fast delivery', description: 'Nationwide shipping across Nigeria.' },
            { icon: 'chat', title: 'WhatsApp support', description: 'Reach us any time for help.' },
        ],
        catalogEyebrow: 'Our products',
        catalogTitle: 'Our products',
    },
};

/** Maps free-text business types to a sector key. */
const SECTOR_ALIASES: Array<[SectorKey, RegExp]> = [
    ['food', /food|restaurant|kitchen|catering|bakery|cafe|café|eatery|drink|grocery|meal|snack|confection/i],
    ['beauty', /beauty|cosmetic|skincare|skin care|makeup|hair|salon|spa|fragrance|perfume|wellness/i],
    ['fashion', /fashion|clothing|apparel|boutique|wear|thrift|textile|shoe|footwear|jewel|accessor|bag|style/i],
    ['home', /home|electronic|gadget|tech|appliance|furniture|decor|hardware|phone|computer|device|kitchenware/i],
    ['services', /service|consult|agency|repair|training|tutor|logistics|clean|photograph|event|rental|booking/i],
];

/** Resolve a sector key from a merchant's business type / category string. */
export function resolveSectorKey(businessType?: string | null): SectorKey {
    if (!businessType) return 'default';
    for (const [key, re] of SECTOR_ALIASES) {
        if (re.test(businessType)) return key;
    }
    return 'default';
}

/** Get the full preset for a merchant's business type / category string. */
export function getSectorPreset(businessType?: string | null): SectorPreset {
    return SECTOR_PRESETS[resolveSectorKey(businessType)];
}
