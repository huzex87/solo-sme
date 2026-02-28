export interface Transaction {
    id: string;
    orderId: string;
    amount: number;
    type: 'revenue' | 'delivery_fee' | 'tax' | 'payout';
    status: 'pending' | 'completed' | 'failed';
    provider: string;
    timestamp: Date;
    description: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    pendingPayouts: number;
    availableBalance: number;
    transactionCount: number;
}

export class LedgerService {
    private static transactions: Transaction[] = [
        {
            id: 'txn_001',
            orderId: 'ord-001',
            amount: 15600,
            type: 'revenue',
            status: 'completed',
            provider: 'paystack',
            timestamp: new Date(Date.now() - 86400000),
            description: 'Sale: Premium Wireless Headphones'
        },
        {
            id: 'txn_002',
            orderId: 'ord-002',
            amount: 2500,
            type: 'delivery_fee',
            status: 'completed',
            provider: 'system',
            timestamp: new Date(Date.now() - 43200000),
            description: 'Delivery Fee: Ikeja to Surulere'
        }
    ];

    /**
     * Records a new transaction atomically.
     */
    static async recordTransaction(data: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
        const newTxn: Transaction = {
            ...data,
            id: `txn_${Math.random().toString(36).slice(2)}`,
            timestamp: new Date()
        };

        console.log(`[LedgerService] Recording ${data.type} of ${data.amount} for order ${data.orderId}`);
        this.transactions.unshift(newTxn);
        return newTxn;
    }

    /**
     * Gets the financial summary for an owner.
     */
    static async getSummary(): Promise<FinancialSummary> {
        const completed = this.transactions.filter(t => t.status === 'completed');

        const totalRevenue = completed
            .filter(t => t.type === 'revenue')
            .reduce((sum, t) => sum + t.amount, 0);

        const availableBalance = totalRevenue * 0.97; // Simulating 3% processing fee

        return {
            totalRevenue,
            pendingPayouts: totalRevenue * 0.2, // Simulating 20% pending
            availableBalance: availableBalance - (totalRevenue * 0.2),
            transactionCount: this.transactions.length
        };
    }

    /**
     * Gets transaction history.
     */
    static async getHistory(): Promise<Transaction[]> {
        return [...this.transactions];
    }
}
