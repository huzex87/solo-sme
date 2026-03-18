import { Tenant } from '@/types';
import { AnalyticsSummary } from './analyticsService';

export interface HealthCheck {
    id: string;
    label: string;
    description: string;
    status: 'pass' | 'warn' | 'fail';
    score: number;       // 0-100 contribution
    weight: number;       // Importance multiplier
    action?: {
        label: string;
        href: string;
    };
}

export interface StoreHealthReport {
    overallScore: number;    // 0-100
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    checks: HealthCheck[];
    topPriority: HealthCheck | null;
    summary: string;
}

/**
 * Calculates a comprehensive "Store Health Score" for merchants.
 * This gives them a single, actionable metric to understand how optimized their store is.
 */
export class StoreHealthService {

    static calculate(tenant: Tenant | null, stats: AnalyticsSummary | null): StoreHealthReport {
        const checks: HealthCheck[] = [];

        // 1. Payment Gateway Connected
        const hasPayment = !!(tenant?.business_config?.paystack_secret_key || tenant?.business_config?.flutterwave_secret_key);
        checks.push({
            id: 'payment',
            label: 'Payment Gateway',
            description: hasPayment ? 'Paystack/Flutterwave is connected and accepting payments.' : 'No payment gateway connected. Customers cannot pay online.',
            status: hasPayment ? 'pass' : 'fail',
            score: hasPayment ? 100 : 0,
            weight: 3,
            action: hasPayment ? undefined : { label: 'Connect Payments', href: '/dashboard/settings' },
        });

        // 2. Products Listed
        const productCount = stats?.topProducts?.length || 0;
        const hasProducts = productCount >= 3;
        checks.push({
            id: 'products',
            label: 'Product Catalog',
            description: hasProducts ? `${productCount}+ products listed. Great catalog diversity.` : 'Add at least 3 products to attract customers.',
            status: hasProducts ? 'pass' : productCount > 0 ? 'warn' : 'fail',
            score: Math.min(productCount * 20, 100),
            weight: 3,
            action: hasProducts ? undefined : { label: 'Add Products', href: '/dashboard/products/new' },
        });

        // 3. Store Branding Configured
        const hasBranding = !!(tenant?.branding_config?.theme || tenant?.branding_config?.logoUrl);
        checks.push({
            id: 'branding',
            label: 'Store Branding',
            description: hasBranding ? 'Custom branding is configured. Your store looks professional.' : 'Customize your store colors and logo to build trust.',
            status: hasBranding ? 'pass' : 'warn',
            score: hasBranding ? 100 : 30,
            weight: 2,
            action: hasBranding ? undefined : { label: 'Customize Brand', href: '/dashboard/settings' },
        });

        // 4. WhatsApp AI Enabled
        const hasWhatsApp = !!tenant?.ai_sales_enabled;
        checks.push({
            id: 'whatsapp',
            label: 'WhatsApp AI Assistant',
            description: hasWhatsApp ? 'AI Assistant is live and handling customer inquiries.' : 'Enable the WhatsApp AI to automate customer support and sales.',
            status: hasWhatsApp ? 'pass' : 'warn',
            score: hasWhatsApp ? 100 : 20,
            weight: 2,
            action: hasWhatsApp ? undefined : { label: 'Enable AI', href: '/dashboard/whatsapp' },
        });

        // 5. Orders Received (Traction)
        const orderCount = stats?.orderCount || 0;
        checks.push({
            id: 'traction',
            label: 'Sales Traction',
            description: orderCount > 0 ? `${orderCount} orders received. Your store is generating revenue.` : 'No orders yet. Share your store link to get started.',
            status: orderCount >= 5 ? 'pass' : orderCount > 0 ? 'warn' : 'fail',
            score: Math.min(orderCount * 10, 100),
            weight: 2,
            action: orderCount > 0 ? undefined : { label: 'Share Store', href: '/dashboard/marketing' },
        });

        // 6. Customer Base
        const customerCount = stats?.customerCount || 0;
        checks.push({
            id: 'customers',
            label: 'Customer Base',
            description: customerCount >= 10 ? `${customerCount} customers. Healthy customer acquisition.` : 'Build your customer base to drive repeat purchases.',
            status: customerCount >= 10 ? 'pass' : customerCount > 0 ? 'warn' : 'fail',
            score: Math.min(customerCount * 5, 100),
            weight: 1,
            action: customerCount > 0 ? undefined : { label: 'View Customers', href: '/dashboard/customers' },
        });

        // 7. Store Description & SEO
        const hasSEO = !!(tenant?.seo_config?.metaTitle || tenant?.description);
        checks.push({
            id: 'seo',
            label: 'SEO & Description',
            description: hasSEO ? 'Store meta data configured for search engines.' : 'Add a store description and meta tags for better visibility.',
            status: hasSEO ? 'pass' : 'warn',
            score: hasSEO ? 100 : 25,
            weight: 1,
            action: hasSEO ? undefined : { label: 'Edit SEO', href: '/dashboard/settings' },
        });

        // 8. Stock Health
        const lowStockAlerts = stats?.stockAlerts?.length || 0;
        const hasStockIssues = lowStockAlerts > 0;
        checks.push({
            id: 'stock',
            label: 'Inventory Health',
            description: hasStockIssues ? `${lowStockAlerts} products are running low on stock.` : 'All products are well-stocked.',
            status: hasStockIssues ? 'warn' : 'pass',
            score: hasStockIssues ? Math.max(100 - lowStockAlerts * 15, 20) : 100,
            weight: 1,
            action: hasStockIssues ? { label: 'View Inventory', href: '/dashboard/products' } : undefined,
        });

        // Calculate weighted overall score
        const totalWeight = checks.reduce((acc, c) => acc + c.weight, 0);
        const weightedSum = checks.reduce((acc, c) => acc + (c.score * c.weight), 0);
        const overallScore = Math.round(weightedSum / totalWeight);

        // Determine grade
        const grade = overallScore >= 95 ? 'A+' :
            overallScore >= 85 ? 'A' :
                overallScore >= 70 ? 'B' :
                    overallScore >= 55 ? 'C' :
                        overallScore >= 40 ? 'D' : 'F';

        // Find top priority (highest weight failing check)
        const topPriority = checks
            .filter(c => c.status !== 'pass')
            .sort((a, b) => b.weight - a.weight)[0] || null;

        // Generate summary
        const passingCount = checks.filter(c => c.status === 'pass').length;
        const summary = overallScore >= 85
            ? 'Your store is in excellent shape. Keep up the great work!'
            : overallScore >= 60
                ? `Good progress! ${checks.length - passingCount} areas need attention to reach peak performance.`
                : `Your store needs work. Focus on ${topPriority?.label || 'the key areas'} to improve conversions.`;

        return { overallScore, grade, checks, topPriority, summary };
    }
}
