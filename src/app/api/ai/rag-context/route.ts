import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { AuditContextService } from '@/services/ai/auditContextService';

/**
 * Reusable server-side function to get platform knowledge
 */
export async function getRagContext(tenantId?: string) {
    try {
        // Try both uppercase and lowercase as a safety measure
        const paths = [
            path.join(process.cwd(), 'whitepaper.md'),
            path.join(process.cwd(), 'WHITE_PAPER.md')
        ];

        let content = "";

        for (const p of paths) {
            if (fs.existsSync(p)) {
                content = fs.readFileSync(p, 'utf8');
                break;
            }
        }

        if (!content) throw new Error('Whitepaper not found');

        // Simple RAG logic: extract core strategic pillars and vision
        const lines = content.split('\n');
        const visionLine = lines.find(l => l.toLowerCase().includes('vision')) || 'SOLO is a world-class SME ecosystem.';
        const principles = lines
            .filter(l => l.startsWith('- **'))
            .map(l => l.replace('- **', '').replace('**', ''))
            .slice(0, 5)
            .join(' | ');

        // 2. Fetch Dynamic Operational Context (Audit Logs)
        let operationalContext = "No recent operational history available.";
        if (tenantId) {
            try {
                operationalContext = await AuditContextService.getAuditOperationalContext(tenantId, 10);
            } catch (e) {
                console.error('[RAG Context] Audit fetch failed:', e);
            }
        }

        return {
            vision: visionLine,
            corePrinciples: principles,
            operationalContext,
            source: 'Platform White Paper + Real-time Audit Telemetry'
        };
    } catch (error) {
        console.error('[RAG Context Logic Error]:', error);
        return {
            vision: 'SOLO is a world-class institutional SME platform.',
            corePrinciples: 'Institutional Standard, AI-Agentic Onboarding, Status Standard UI',
            operationalContext: 'Operational history currently unavailable.',
            source: 'Fallback Knowledge'
        };
    }
}

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || undefined;

    const knowledge = await getRagContext(tenantId);
    if (!knowledge) {
        return NextResponse.json({ error: 'Failed to load platform knowledge' }, { status: 500 });
    }

    return NextResponse.json({ knowledge });
}
