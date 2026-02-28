import { StaffMember } from '@/types';

export class StaffService {
    private static DEMO_STAFF: StaffMember[] = [
        {
            id: 's1',
            tenantId: 't1',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: 'manager',
            status: 'active',
            lastActive: new Date().toISOString()
        },
        {
            id: 's2',
            tenantId: 't1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            role: 'cashier',
            status: 'active',
            lastActive: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    static async getStaff(tenantId: string): Promise<StaffMember[]> {
        console.log(`[StaffService] Fetching staff for ${tenantId}`);
        await new Promise(r => setTimeout(r, 500));
        return this.DEMO_STAFF.filter(s => s.tenantId === tenantId);
    }

    static async addStaff(tenantId: string, data: Partial<StaffMember>): Promise<StaffMember> {
        console.log(`[StaffService] Adding staff`, data);
        await new Promise(r => setTimeout(r, 800));
        const newStaff: StaffMember = {
            id: `s${Date.now()}`,
            tenantId,
            name: data.name || 'New Staff',
            email: data.email || '',
            role: data.role as 'manager' | 'cashier' | 'dispatcher' || 'cashier',
            status: 'active',
            lastActive: new Date().toISOString()
        };
        this.DEMO_STAFF.push(newStaff);
        return newStaff;
    }
}
