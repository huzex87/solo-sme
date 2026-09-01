/**
 * The legal entity behind SOLO SME.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE EXISTS
 *
 * Meta Business Verification cross-checks this website against the CAC documents
 * submitted in Business Manager. Reviewers look for the registered company name,
 * registration number and address on the site, and reject when they can't tie the
 * domain to the documents. Name mismatch is the single most common rejection cause.
 *
 * Every value below must match the CAC certificate CHARACTER-FOR-CHARACTER —
 * including the company-type suffix ("Limited" vs "Ltd") and address punctuation —
 * AND must match the legal name on the Meta business portfolio.
 *
 * ⚠️  OPEN ACTION (2026-07-27): the Meta business portfolio reads "Disbusify Tech
 *     Solutions Ltd" — missing the 'r'. The CAC Certificate of Incorporation
 *     (RC 8530579, 2 June 2025) reads "DISBURSIFY TECH SOLUTIONS LTD". The
 *     portfolio name is a typo and must be corrected in Business Manager, or
 *     verification will fail the name match.
 * ─────────────────────────────────────────────────────────────────────────────
 */
/** Canonical mail domain. Every address in MAIL must live here. */
export const MAIL_DOMAIN = 'solosme.ng';

/**
 * Every address the app shows or sends from.
 *
 * All of these MUST be on MAIL_DOMAIN. Sending from a domain that isn't verified
 * in Resend gets the message rejected outright, and a support address on a domain
 * we don't own is unreachable — both were previously true: EMAIL_FROM defaulted to
 * `solo-sme.com`, the API route fell back to `onboarding@resend.dev`, and the
 * privacy policy listed `legal@solosme.com` (wrong TLD).
 *
 * ⚠️  `contact` and `legal` must accept INBOUND mail. Vercel provides no mailboxes —
 *     set up forwarding (Cloudflare Email Routing or ImprovMX) or these bounce.
 */
export const MAIL = {
    /** Public support address. Shown on the site. */
    contact: `hello@${MAIL_DOMAIN}`,
    /** Data-protection / legal contact, cited in the privacy policy. */
    legal: `legal@${MAIL_DOMAIN}`,
    /** Transactional sender for receipts and notifications. Must be verified in Resend. */
    noreply: `noreply@${MAIL_DOMAIN}`,
    /** Stand-in when a walk-in POS customer has no email and the tenant has none either. */
    posWalkIn: `retail@${MAIL_DOMAIN}`,
} as const;

export const COMPANY = {
    /** Registered name per CAC Certificate of Incorporation. */
    legalName: 'Disbursify Tech Solutions Ltd',
    /** CAC registration number per Certificate of Incorporation. */
    rcNumber: 'RC 8530579',
    /**
     * Registered address as filed with CAC. Note the CAC record spells the street
     * "COMMASSIE"; the street is actually Ibrahim Coomassie Road. We mirror the CAC
     * spelling here because Meta compares the site against the filed document.
     */
    address: 'No. 3, Ibrahim Commassie Road, GRA Ring Road, Katsina, Katsina State, Nigeria',
    /** Business email on the solosme.ng domain — reviewers check the domain matches. */
    email: MAIL.contact,
    /** Product name. Trades under the legal entity above. */
    product: 'SOLO SME',
} as const;

/** One-line ownership statement for footers and legal pages. */
export const COMPANY_ATTRIBUTION =
    `${COMPANY.product} is a product of ${COMPANY.legalName}${COMPANY.rcNumber ? ` (${COMPANY.rcNumber})` : ''}.`;

/** Default From header for transactional mail, overridable via EMAIL_FROM. */
export const MAIL_FROM_DEFAULT = `${COMPANY.product} <${MAIL.noreply}>`;
