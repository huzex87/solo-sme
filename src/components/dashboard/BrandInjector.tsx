"use client";

import { useEffect } from "react";
import { useTenant } from "@/context/TenantContext";

export function BrandInjector() {
    const { tenant } = useTenant();

    useEffect(() => {
        if (!tenant?.branding_config) return;

        const { primaryColor, accentColor } = tenant.branding_config;
        const root = document.documentElement;

        if (primaryColor) {
            root.style.setProperty("--brand-primary", primaryColor);
            // Generate translucent versions for glassmorphism
            root.style.setProperty("--brand-primary-light", `${primaryColor}15`);
            root.style.setProperty("--brand-primary-soft", `${primaryColor}08`);
        }

        if (accentColor) {
            root.style.setProperty("--brand-accent", accentColor);
        }

        return () => {
            // Clean up if needed, though usually we want brand persistent
        };
    }, [tenant]);

    return null;
}
