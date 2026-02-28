export interface DriverOrder {
    id: string;
    tenantName: string;
    pickupAddress: string;
    deliveryAddress: string;
    distance: string;
    fee: number;
    status: 'pending' | 'claimed' | 'picked_up' | 'arriving' | 'delivered';
}

export interface DriverEarnings {
    daily: number;
    weekly: number;
    total: number;
    balance: number;
}

export class DriverService {
    private static mockTasks: DriverOrder[] = [
        { id: 'ORD-101', tenantName: 'Demo Boutique', pickupAddress: 'SOLO HQ, Ikeja', deliveryAddress: 'Victoria Island, Lagos', distance: '12.4km', fee: 1500, status: 'pending' },
        { id: 'ORD-102', tenantName: 'Lagos Fashion', pickupAddress: 'Lekki Phase 1', deliveryAddress: 'Surulere, Lagos', distance: '8.2km', fee: 1200, status: 'pending' },
    ];

    static async getAvailableTasks(): Promise<DriverOrder[]> {
        // Simulate API fetch
        return new Promise(resolve => setTimeout(() => resolve(this.mockTasks), 800));
    }

    static async claimTask(id: string): Promise<boolean> {
        const task = this.mockTasks.find(t => t.id === id);
        if (task) {
            task.status = 'claimed';
            return true;
        }
        return false;
    }

    static async updateTaskStatus(id: string, status: DriverOrder['status']): Promise<void> {
        const task = this.mockTasks.find(t => t.id === id);
        if (task) task.status = status;
    }

    static async getEarnings(): Promise<DriverEarnings> {
        return {
            daily: 4500,
            weekly: 32000,
            total: 156000,
            balance: 8500
        };
    }
}
