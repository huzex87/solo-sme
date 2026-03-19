/**
 * Startup environment variable validation.
 * Import this in instrumentation.ts or layout.tsx to run on server start.
 */

interface EnvVar {
    key: string;
    required: boolean;
    label: string;
}

const ENV_VARS: EnvVar[] = [
    // Core (required)
    { key: 'NEXT_PUBLIC_SUPABASE_URL', required: true, label: 'Supabase URL' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, label: 'Supabase Anon Key' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', required: true, label: 'Supabase Service Role Key' },
    { key: 'NEXT_PUBLIC_APP_URL', required: true, label: 'App URL' },

    // Rate limiting (required in production)
    { key: 'UPSTASH_REDIS_REST_URL', required: process.env.NODE_ENV === 'production', label: 'Upstash Redis URL' },
    { key: 'UPSTASH_REDIS_REST_TOKEN', required: process.env.NODE_ENV === 'production', label: 'Upstash Redis Token' },

    // Optional services
    { key: 'GEMINI_API_KEY', required: false, label: 'Gemini AI' },
    { key: 'RESEND_API_KEY', required: false, label: 'Resend Email' },
    { key: 'WHATSAPP_ACCESS_TOKEN', required: false, label: 'WhatsApp API' },
    { key: 'WHATSAPP_PHONE_NUMBER_ID', required: false, label: 'WhatsApp Phone' },
    { key: 'WHATSAPP_APP_SECRET', required: false, label: 'WhatsApp App Secret' },
    { key: 'PAYSTACK_SECRET_KEY', required: false, label: 'Paystack' },
    { key: 'FLUTTERWAVE_SECRET_KEY', required: false, label: 'Flutterwave' },
];

export function validateEnvironment() {
    const missing: string[] = [];
    const unconfigured: string[] = [];

    for (const v of ENV_VARS) {
        const value = process.env[v.key];
        if (!value) {
            if (v.required) {
                missing.push(`  - ${v.key} (${v.label})`);
            } else {
                unconfigured.push(v.label);
            }
        }
    }

    if (missing.length > 0) {
        console.error(`\n[ENV] Missing REQUIRED environment variables:\n${missing.join('\n')}\n`);
        if (process.env.NODE_ENV === 'production') {
            throw new Error(`Missing required environment variables: ${missing.length} vars`);
        }
    }

    if (unconfigured.length > 0) {
        console.warn(`[ENV] Optional services not configured: ${unconfigured.join(', ')}`);
    }
}
