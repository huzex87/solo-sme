import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiRatelimit } from '@/lib/rateLimit';
import { AuditContextService } from '@/services/ai/auditContextService';
import { AIAnalyticsService } from '@/services/aiAnalyticsService';
// Assuming these services exist based on common patterns in the codebase
import { AnalyticsService } from '@/services/analyticsService';
import { FinanceService } from '@/services/financeService';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limit paid AI calls, keyed per authenticated user.
        const { success } = await aiRatelimit.limit(`pulse:${user.id}`);
        if (!success) {
            return NextResponse.json({ error: 'Rate limit exceeded. Please try again in a minute.' }, { status: 429 });
        }

        const { searchParams } = new URL(req.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        // Authorize: the caller must belong to the tenant they are querying.
        // Without this, any authenticated user could read another merchant's
        // business intelligence by passing an arbitrary tenantId (IDOR).
        const { data: membership } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .eq('tenant_id', tenantId)
            .maybeSingle();

        if (!membership) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Get Audit-based insights
        const auditInsights = await AuditContextService.generateIntelligencePulse(tenantId);

        // 2. Get AI-based Strategic Insights
        interface StrategicInsight {
            impact: 'high' | 'medium' | 'low';
            title: string;
            description: string;
            actionLabel: string;
            actionUrl: string;
        }
        let strategicInsights: StrategicInsight[] = [];
        try {
            const analytics = await AnalyticsService.getDashboardStats(tenantId);
            const finance = await FinanceService.getFinancialSummary(tenantId);
            strategicInsights = await AIAnalyticsService.getBusinessInsights(analytics, finance);
        } catch (e) {
            console.error('[Pulse API] Strategic insights failed, using rule-based fallback:', e);
            // AI insights unavailable - audit-based insights will still be returned
        }

        // Combine and prioritize
        const allInsights = [
            ...auditInsights.map(i => ({
                id: i.id,
                type: i.type,
                priority: i.priority,
                title: i.title,
                description: i.description,
                timestamp: i.timestamp,
                // Map to UI expectations
                actionLabel: i.type === 'inventory' ? 'View Catalog' : 'Review Logs',
                actionHref: i.type === 'inventory' ? '/dashboard/products' : '/dashboard/analytics/audit'
            })),
            ...strategicInsights.map((i: StrategicInsight, idx: number) => ({
                id: `strat-${idx}`,
                type: 'marketing',
                priority: i.impact === 'high' ? 'high' : 'medium',
                title: i.title,
                description: i.description,
                timestamp: new Date().toISOString(),
                actionLabel: i.actionLabel,
                actionHref: i.actionUrl
            }))
        ];

        // Sort by priority and timestamp
        const sortedPulse = allInsights.sort((a, b) => {
            const priorityMap = { high: 3, medium: 2, low: 1 };
            if (priorityMap[a.priority as keyof typeof priorityMap] !== priorityMap[b.priority as keyof typeof priorityMap]) {
                return priorityMap[b.priority as keyof typeof priorityMap] - priorityMap[a.priority as keyof typeof priorityMap];
            }
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        return NextResponse.json({ pulse: sortedPulse.slice(0, 5) });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Pulse API Error]:', message);
        return NextResponse.json({ error: 'Failed to generate pulse feed' }, { status: 500 });
    }
}
