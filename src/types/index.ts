export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    custom_domain?: string;
    brand_color: string;
    ai_onboarding_completed: boolean;
}

export interface StaffMember {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'manager' | 'cashier' | 'dispatcher' | 'staff';
    status: 'active' | 'inactive';
    lastActive: string;
}
