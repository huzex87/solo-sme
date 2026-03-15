import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient();
    const startTime = Date.now();

    const health: any = {
        status: 'online',
        timestamp: new Date().toISOString(),
        services: {
            database: { status: 'loading', latency: 0 },
            resend: { status: 'loading' },
            meta: { status: 'loading' },
            vercel: { status: 'online' } // Static assumption for current runtime
        }
    };

    try {
        // 1. Check Database
        const dbStart = Date.now();
        const { error } = await supabase.from('tenants').select('count', { count: 'exact', head: true });
        health.services.database.latency = Date.now() - dbStart;
        health.services.database.status = error ? 'error' : 'online';

        if (error) {
            health.status = 'degraded';
            health.services.database.message = error.message;
        }

        // 2. Check Resend (Environment Presence)
        const hasResend = !!process.env.RESEND_API_KEY;
        health.services.resend.status = hasResend ? 'online' : 'unconfigured';
        if (!hasResend) health.status = 'degraded';

        // 3. Check Meta/WhatsApp (Environment Presence)
        const hasMeta = !!process.env.WHATSAPP_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;
        health.services.meta.status = hasMeta ? 'online' : 'unconfigured';
        if (!hasMeta) health.status = 'degraded';

        health.uptime = process.uptime();
        health.total_latency = Date.now() - startTime;

        return NextResponse.json(health);
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
