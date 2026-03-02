import { supabase } from '@/lib/supabase';
import { StaffMember } from '@/types';

export class StaffService {
    /**
     * Fetches real staff members from Supabase.
     */
    static async getStaff(tenantId: string): Promise<StaffMember[]> {
        console.log(`[StaffService] Fetching staff for ${tenantId}`);

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
            lastActive: s.created_at // Defaulting since we don't have a real lastActive column yet
        }));
    }

    /**
     * Adds a new staff member to Supabase.
     */
    static async addStaff(tenantId: string, data: Partial<StaffMember>): Promise<StaffMember | null> {
        console.log(`[StaffService] Adding staff to tenant ${tenantId}`, data);

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
