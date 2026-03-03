import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Read the White Paper as a knowledge source
        const whitePaperPath = path.join(process.cwd(), 'WHITE_PAPER.md');
        const content = fs.readFileSync(whitePaperPath, 'utf8');

        // Simple RAG logic: extract core strategic pillars and vision
        const lines = content.split('\n');
        const visionLine = lines.find(l => l.includes('Vision')) || '';
        const principles = lines.filter(l => l.startsWith('- **')).slice(0, 5).join('\n');

        // Return a condensed knowledge context for the AI
        return NextResponse.json({
            knowledge: {
                vision: visionLine,
                corePrinciples: principles,
                source: 'Platform White Paper (March 2026 Update)'
            }
        });
    } catch (error) {
        console.error('RAG Context Error:', error);
        return NextResponse.json({ error: 'Failed to load platform knowledge' }, { status: 500 });
    }
}
