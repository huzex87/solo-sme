import { NextRequest, NextResponse } from 'next/server';
import { ratelimit } from '@/lib/rateLimit';

/**
 * Server-side email sending via Resend API.
 * Keeps API key secure on the server.
 *
 * Required env: RESEND_API_KEY
 * Optional env: EMAIL_FROM (defaults to MAIL_FROM_DEFAULT — noreply@solosme.ng)
 *
 * The From domain must be verified in Resend or the send is rejected. Defaulting
 * to resend.dev used to mask that misconfiguration in production.
 */
import { createClient } from '@/lib/supabase/server';
import { MAIL_FROM_DEFAULT } from '@/lib/company';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await ratelimit.limit(`email:${user.id}`);
    if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please try again.' }, { status: 429 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        console.warn('[Email API] RESEND_API_KEY not configured — skipping email send');
        return NextResponse.json({ message: 'Email service not configured' }, { status: 200 });
    }

    try {
        const body = await req.json();
        const { to, subject, html, from } = body;

        if (!to || !subject || !html) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, html' },
                { status: 400 }
            );
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: from || process.env.EMAIL_FROM || MAIL_FROM_DEFAULT,
                to: [to],
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Email API] Resend error:', errorData);
            return NextResponse.json(
                { error: 'Failed to send email', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ success: true, id: data.id });
    } catch (error) {
        console.error('[Email API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
