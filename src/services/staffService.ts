import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { Permission } from '@/types';

export interface StaffMember {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'manager' | 'cashier' | 'dispatcher' | 'staff' | 'analyst';
    permissions: Permission[];
    status: 'active' | 'inactive' | 'invited';
    lastActive: string;
    invitationToken?: string;
}

export const DEFAULT_PERMISSIONS: Record<StaffMember['role'], Permission[]> = {
    owner: [
        'orders:view', 'orders:edit', 'orders:dispatch',
        'products:view', 'products:edit',
        'finance:view',
        'settings:view', 'settings:edit',
        'staff:view', 'staff:edit',
        'marketing:view', 'marketing:edit',
        'customers:view', 'customers:edit',
        'pos:access', 'analytics:view'
    ],
    admin: [
        'orders:view', 'orders:edit', 'orders:dispatch',
        'products:view', 'products:edit',
        'finance:view',
        'settings:view',
        'staff:view',
        'marketing:view', 'marketing:edit',
        'customers:view', 'customers:edit',
        'pos:access', 'analytics:view'
    ],
    manager: [
        'orders:view', 'orders:edit', 'orders:dispatch',
        'products:view', 'products:edit',
        'marketing:view', 'marketing:edit',
        'customers:view', 'customers:edit',
        'pos:access', 'analytics:view'
    ],
    cashier: [
        'orders:view', 'orders:dispatch',
        'products:view',
        'pos:access'
    ],
    dispatcher: [
        'orders:view', 'orders:dispatch'
    ],
    staff: [
        'orders:view',
        'products:view',
        'customers:view'
    ],
    analyst: [
        'orders:view',
        'products:view',
        'finance:view',
        'analytics:view',
        'customers:view'
    ]
};

export class StaffService {
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Checks if a staff member has a specific permission.
     */
    static hasPermission(role: StaffMember['role'], permission: Permission, customPermissions?: Permission[]): boolean {
        const permissions = customPermissions || DEFAULT_PERMISSIONS[role] || [];
        return permissions.includes(permission);
    }

    /**
     * Fetches real staff members from Supabase.
     */
    static async getStaff(tenantId: string, client?: SupabaseClient): Promise<StaffMember[]> {
        if (!isSupabaseConfigured) return [];
        const supabase = this.getClient(client);
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
            name: s.full_name || 'Staff Member',
            email: s.email,
            role: s.role as StaffMember['role'],
            permissions: (s.permissions as Permission[]) || DEFAULT_PERMISSIONS[s.role as StaffMember['role']] || [],
            status: s.is_active ? 'active' : 'inactive',
            lastActive: s.created_at
        }));
    }

    /**
     * Adds a new staff member to Supabase.
     */
    static async addStaff(tenantId: string, data: Partial<StaffMember>, client?: SupabaseClient): Promise<StaffMember | null> {
        if (!isSupabaseConfigured) return null;
        const supabase = this.getClient(client);
        const role = (data.role || 'staff') as StaffMember['role'];

        const { data: record, error } = await supabase
            .from('staff_members')
            .insert([{
                tenant_id: tenantId,
                full_name: data.name,
                email: data.email,
                role: role,
                permissions: data.permissions || DEFAULT_PERMISSIONS[role],
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
            metadata: { email: data.email, role: role }
        }, client);

        return {
            id: record.id,
            tenantId: record.tenant_id,
            name: record.full_name,
            email: record.email,
            role: record.role as StaffMember['role'],
            permissions: (record.permissions as Permission[]) || DEFAULT_PERMISSIONS[record.role as StaffMember['role']] || [],
            status: record.is_active ? 'active' : 'inactive',
            lastActive: record.created_at
        };
    }

    /**
     * Toggles staff status.
     */
    static async toggleStatus(staffId: string, isActive: boolean, client?: SupabaseClient): Promise<void> {
        if (!isSupabaseConfigured) return;
        const supabase = this.getClient(client);
        await supabase
            .from('staff_members')
            .update({ is_active: isActive })
            .eq('id', staffId);
    }

    /**
     * Invites a new staff member via a secure token.
     */
    static async inviteStaff(tenantId: string, email: string, role: StaffMember['role'], client?: SupabaseClient): Promise<string | null> {
        if (!isSupabaseConfigured) return null;
        const supabase = this.getClient(client);
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const { error } = await supabase
            .from('staff_members')
            .insert([{
                tenant_id: tenantId,
                email,
                role,
                permissions: DEFAULT_PERMISSIONS[role],
                invitation_token: token,
                invited_at: new Date().toISOString(),
                is_active: false,
                full_name: 'Pending Invite'
            }]);

        if (error) {
            console.error('[StaffService] Invite failed:', error);
            return null;
        }

        return token;
    }
}
