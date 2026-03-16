import { useTenant } from '@/context/TenantContext';

export type Action =
    | 'view_analytics'
    | 'manage_products'
    | 'create_order'
    | 'refund_order'
    | 'update_order_status'
    | 'manage_staff'
    | 'manage_settings';

export const usePermissions = () => {
    const { userRole } = useTenant();

    const can = (action: Action): boolean => {
        // Owners and Admins have full access
        if (userRole === 'owner' || userRole === 'admin') return true;

        switch (action) {
            case 'view_analytics':
                return ['manager', 'analyst'].includes(userRole);
            case 'manage_products':
                return ['manager'].includes(userRole);
            case 'create_order':
                return ['manager', 'cashier'].includes(userRole);
            case 'update_order_status':
                return ['manager', 'cashier', 'dispatcher'].includes(userRole);
            case 'refund_order':
                return false; // Only owners/admins can refund
            case 'manage_staff':
            case 'manage_settings':
                return false;
            default:
                return false;
        }
    };

    return { can, userRole };
};
