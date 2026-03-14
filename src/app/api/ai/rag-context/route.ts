import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';

/**
 * Reusable server-side function to get platform knowledge
 */
export async function getRagContext() {
    try {
        const whitePaperPath = path.join(process.cwd(), 'WHITE_PAPER.md');
        const content = fs.readFileSync(whitePaperPath, 'utf8');

        // Simple RAG logic: extract core strategic pillars and vision
        const lines = content.split('\n');
        const visionLine = lines.find(l => l.includes('Vision')) || '';
        const principles = lines.filter(l => l.startsWith('- **')).slice(0, 5).join('\n');

        return {
            vision: visionLine,
            corePrinciples: principles,
            source: 'Platform White Paper (March 2026 Update)'
        };
    } catch (error) {
        console.error('[RAG Context Logic Error]:', error);
        return null;
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
