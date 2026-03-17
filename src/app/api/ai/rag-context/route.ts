import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';

/**
 * Reusable server-side function to get platform knowledge
 */
export async function getRagContext() {
    try {
        // Try both uppercase and lowercase as a safety measure
        const paths = [
            path.join(process.cwd(), 'whitepaper.md'),
            path.join(process.cwd(), 'WHITE_PAPER.md')
        ];

        let whitePaperPath = paths[0];
        let content = "";

        for (const p of paths) {
            if (fs.existsSync(p)) {
                whitePaperPath = p;
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

        return {
            vision: visionLine,
            corePrinciples: principles,
            source: 'Platform White Paper (2026 Institutional v5.0)'
        };
    } catch (error) {
        console.error('[RAG Context Logic Error]:', error);
        return {
            vision: 'SOLO is a world-class institutional SME platform.',
            corePrinciples: 'Institutional Standard, AI-Agentic Onboarding, Status Standard UI',
            source: 'Fallback Knowledge'
        };
    }
}

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const knowledge = await getRagContext();
    if (!knowledge) {
        return NextResponse.json({ error: 'Failed to load platform knowledge' }, { status: 500 });
    }

    return NextResponse.json({ knowledge });
}
