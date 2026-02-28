export interface LoyaltyAccount {
    customerId: string;
    points: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    history: LoyaltyAction[];
}

export interface LoyaltyAction {
    id: string;
    type: 'earn' | 'redeem';
    points: number;
    description: string;
    date: Date;
}

export class LoyaltyService {
    private static accounts: Record<string, LoyaltyAccount> = {
        'c5': {
            customerId: 'c5',
            points: 1250,
            tier: 'Gold',
            history: [
                { id: 'l1', type: 'earn', points: 1000, description: 'Purchase: Premium Headphones', date: new Date(Date.now() - 86400000) },
                { id: 'l2', type: 'earn', points: 250, description: 'Review Bonus', date: new Date() }
            ]
        }
    };

    /**
     * Gets a customer's loyalty account.
     */
    static getAccount(customerId: string): LoyaltyAccount {
        return this.accounts[customerId] || {
            customerId,
            points: 0,
            tier: 'Bronze',
            history: []
        };
    }

    /**
     * Calculates points for a purchase (1 point per 100 currency units).
     */
    static calculatePoints(amount: number): number {
        return Math.floor(amount / 100);
    }

    /**
     * Adds points to an account.
     */
    static addPoints(customerId: string, points: number, description: string): void {
        const account = this.getAccount(customerId);
        account.points += points;
        account.history.unshift({
            id: `act_${Math.random().toString(36).slice(2)}`,
            type: 'earn',
            points,
            description,
            date: new Date()
        });

        // Tier upgrade logic
        if (account.points > 5000) account.tier = 'Platinum';
        else if (account.points > 2000) account.tier = 'Gold';
        else if (account.points > 500) account.tier = 'Silver';

        this.accounts[customerId] = account;
    }

    /**
     * Converts points to a discount value (e.g., 10 points = 1 currency unit).
     */
    static getDiscountValue(points: number): number {
        return points * 10;
    }
}
