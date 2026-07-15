import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/baseUrl';
import { TenantService } from '@/services/tenantService';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { tenantId, tier } = body;

        if (!tenantId || !tier) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Authorize user
        const tenant = await TenantService.getTenant(tenantId, supabase);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        if (tenant.owner_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Retrieve plan code from environment variables
        const growthPlan = process.env.PAYSTACK_GROWTH_PLAN_CODE || 'PLN_growth_mock';
        const enterprisePlan = process.env.PAYSTACK_ENTERPRISE_PLAN_CODE || 'PLN_enterprise_mock';

        const planCode = tier === 'growth' ? growthPlan : tier === 'enterprise' ? enterprisePlan : null;
        if (!planCode) {
            return NextResponse.json({ error: 'Invalid subscription tier selected' }, { status: 400 });
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json({ error: 'Platform billing keys not configured' }, { status: 500 });
        }

        const amount = tier === 'growth' ? 9900 : 49900; // in Naira

        // Initialize transaction with subscription plan
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: user.email,
                amount: amount * 100, // in kobo
                plan: planCode, // Attach plan code here to automatically create a subscription
                callback_url: `${getBaseUrl()}/dashboard/settings?tab=billing&success=true`,
                metadata: {
                    tenantId,
                    userId: user.id,
                    tier,
                    isSubscription: true
                }
            })
        });

        const data = await response.json();
        if (!data.status) {
            return NextResponse.json({ error: data.message || 'Paystack plan initialization failed' }, { status: 400 });
        }

        return NextResponse.json({
            checkoutUrl: data.data.authorization_url,
            reference: data.data.reference
        });
    } catch (error) {
        console.error('[Subscription API Error]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
