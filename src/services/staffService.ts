import { supabase } from '@/lib/supabase';

export interface StaffMember {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'manager' | 'cashier' | 'dispatcher' | 'staff';
    status: 'active' | 'inactive';
    lastActive: string;
}

export class StaffService {
    /**
     * Fetches real staff members from Supabase.
     */
    static async getStaff(tenantId: string): Promise<StaffMember[]> {
        const { data, error } = await supabase
            .from('staff_members')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error) {
            console.error('[StaffService] Error fetching staff:', error);
            return [];
        }

        return data.map(s => ({
            id: s.id,
            tenantId: s.tenant_id,
            name: s.full_name,
            email: s.email,
            role: s.role,
            status: s.is_active ? 'active' : 'inactive',
            lastActive: s.created_at
        }));
    }

    /**
     * Adds a new staff member to Supabase.
     */
    static async addStaff(tenantId: string, data: Partial<StaffMember>): Promise<StaffMember | null> {
        const { data: record, error } = await supabase
            .from('staff_members')
            .insert([{
                tenant_id: tenantId,
                full_name: data.name,
                email: data.email,
                role: data.role || 'staff',
                is_active: true
            }])
            .select()
            .single();

        if (error) {
            console.error('[StaffService] Error adding staff:', error);
            return null;
        }

        // Record audit action
        const { AuditService } = await import('./auditService');
        await AuditService.logAction({
            tenant_id: tenantId,
            action: 'add_staff',
            entity_type: 'staff',
            entity_id: record.id,
            metadata: { email: data.email, role: data.role }
        });

        return {
            id: record.id,
            tenantId: record.tenant_id,
            name: record.full_name,
            email: record.email,
            role: record.role,
            status: record.is_active ? 'active' : 'inactive',
            lastActive: record.created_at
        };
    }

    /**
     * Toggles staff status.
     */
    static async toggleStatus(staffId: string, isActive: boolean): Promise<void> {
        await supabase
            .from('staff_members')
            .update({ is_active: isActive })
            .eq('id', staffId);
    }
}
