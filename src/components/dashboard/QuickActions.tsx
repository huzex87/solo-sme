'use client';

import Link from 'next/link';
import {
    Plus, Share2, QrCode, MessageCircle,
    Package, FileText, Instagram, Zap, BarChart3, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/context/TenantContext';
import { URLService } from '@/lib/url';
import { toast } from 'sonner';

const ACTIONS = [
    {
        id: 'add-product',
        label: 'Add Product',
        icon: Plus,
        href: '/dashboard/products/new',
        color: 'bg-slate-950 text-white',
        description: 'List a new item',
    },
    {
        id: 'import',
        label: 'Import Store',
        icon: Instagram,
        href: '/dashboard/import',
        color: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
        description: 'From social media',
    },
    {
        id: 'share',
        label: 'Share Store',
        icon: Share2,
        action: 'share',
        color: 'bg-blue-500 text-white',
        description: 'Copy store link',
    },
    {
        id: 'invoice',
        label: 'New Invoice',
        icon: FileText,
        href: '/dashboard/invoices',
        color: 'bg-amber-500 text-white',
        description: 'Bill a customer',
    },
    {
        id: 'marketing',
        label: 'Campaign',
        icon: Zap,
        href: '/dashboard/marketing',
        color: 'bg-emerald-500 text-white',
        description: 'Boost sales',
    },
    {
        id: 'analytics',
        label: 'Reports',
        icon: BarChart3,
        href: '/dashboard/analytics',
        color: 'bg-indigo-500 text-white',
        description: 'View insights',
    },
];

export function QuickActions() {
    const { subdomain } = useTenant();

    const handleAction = (actionId: string) => {
        if (actionId === 'share') {
            const storeUrl = URLService.getStoreUrl(subdomain);
            navigator.clipboard.writeText(storeUrl);
            toast.success('Store link copied to clipboard!');

            // Also try native share if available
            if (navigator.share) {
                navigator.share({
                    title: 'Check out my store',
                    url: storeUrl,
                }).catch(() => { /* user cancelled */ });
            }
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Quick Actions
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {ACTIONS.map((action) => {
                    const Icon = action.icon;
                    const Wrapper = action.href ? Link : 'button';
                    const props = action.href
                        ? { href: action.href }
                        : { onClick: () => handleAction(action.id) };

                    return (
                        <Wrapper
                            key={action.id}
                            {...(props as any)}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-soft-sm hover:shadow-premium transition-all duration-300 group active:scale-95"
                        >
                            <div className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                                action.color
                            )}>
                                <Icon size={18} />
                            </div>
                            <div className="text-center">
                                <p className="text-[11px] font-bold text-slate-950 leading-tight">{action.label}</p>
                                <p className="text-[10px] font-medium text-slate-500 mt-0.5 hidden md:block">{action.description}</p>
                            </div>
                        </Wrapper>
                    );
                })}
            </div>
        </div>
    );
}
