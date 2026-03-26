import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

        const { searchParams } = new URL(req.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        // 1. Get Audit-based insights
        const auditInsights = await AuditContextService.generateIntelligencePulse(tenantId);

        // 2. Get AI-based Strategic Insights
        let strategicInsights: any[] = [];
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
            ...strategicInsights.map((i, idx) => ({
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
        console.error('[Pulse API Error]:', error);
        return NextResponse.json({ error: 'Failed to generate pulse feed' }, { status: 500 });
    }
}
