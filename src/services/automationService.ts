export type AutomationTrigger = 'abandoned_cart' | 'recall_dormant' | 'vip_thank_you';

export interface AutomationSequence {
    id: string;
    trigger: AutomationTrigger;
    status: 'active' | 'paused';
    lastRan?: Date;
    totalSent: number;
    conversions: number;
}

export class AutomationService {
    private static sequences: AutomationSequence[] = [
        {
            id: 'seq_001',
            trigger: 'abandoned_cart',
            status: 'active',
            lastRan: new Date(),
            totalSent: 145,
            conversions: 24
        },
        {
            id: 'seq_002',
            trigger: 'recall_dormant',
            status: 'active',
            lastRan: new Date(Date.now() - 3600000),
            totalSent: 82,
            conversions: 7
        }
    ];

    /**
     * Triggers an automation workflow manually or via background worker.
     */
    static async triggerWorkflow(trigger: AutomationTrigger, customerEmail: string): Promise<boolean> {
        console.log(`[AutomationService] Triggering ${trigger} sequence for ${customerEmail}`);

        // Mocking send logic
        await new Promise(resolve => setTimeout(resolve, 800));

        return true;
    }

    /**
     * Gets all configured automation sequences.
     */
    static getSequences(): AutomationSequence[] {
        return [...this.sequences];
    }

    /**
     * Toggles a sequence status.
     */
    static toggleSequence(id: string): void {
        const seq = this.sequences.find(s => s.id === id);
        if (seq) {
            seq.status = seq.status === 'active' ? 'paused' : 'active';
        }
    }
}
