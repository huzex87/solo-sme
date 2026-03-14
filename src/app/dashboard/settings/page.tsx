"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Shield,
  ShoppingBag,
  Palette,
  Check,
  Copy,
  Zap,
  Lock,
  Settings,
  User,
  CreditCard,
  Map,
  Loader2,
  Truck,
  Bell,
  Brain,
  Hash,
  Search,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/hooks/useAuth";
import { DomainService, DomainVerification } from "@/services/domainService";
import { PageLoading } from "@/components/ui/LoadingIndicator";
import { ErrorState } from "@/components/ui/StatusStates";
import { toast } from "sonner";
import { QRCodeCard } from "@/components/dashboard/QRCodeCard";

// Modular Panel Imports
import { DomainPanel } from "@/components/dashboard/settings/DomainPanel";
import { BrandingPanel } from "@/components/dashboard/settings/BrandingPanel";
import { StorefrontPanel } from "@/components/dashboard/settings/StorefrontPanel";
import { IntegrationPanel } from "@/components/dashboard/settings/IntegrationPanel";
import { AccountPanel } from "@/components/dashboard/settings/AccountPanel";
import { LogisticsPanel } from "@/components/dashboard/settings/LogisticsPanel";
import { AutomationPanel } from "@/components/dashboard/settings/AutomationPanel";

type Section = "domain" | "branding" | "storefront" | "account" | "logistics" | "automation" | "integrations";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "domain", label: "Store Domain", icon: Globe },
  { id: "branding", label: "Store Branding", icon: Palette },
  { id: "storefront", label: "Storefront Content", icon: ShoppingBag },
  { id: "account", label: "Account & Security", icon: Shield },
  { id: "logistics", label: "Logistics & Delivery", icon: Truck },
  { id: "automation", label: "Automation Lab", icon: Brain },
  { id: "integrations", label: "API Integrations", icon: Zap },
];

export default function SettingsPage() {
  const router = useRouter();
  const { tenantId, tenantName, subdomain, userName, tenant, isLoading: isTenantLoading, updateTenantState } = useTenant();
  const [active, setActive] = useState<Section>("domain");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [domainStatus, setDomainStatus] = useState<DomainVerification | null>(null);
  const [suggestedDomains, setSuggestedDomains] = useState<string[]>([]);

  const supabase = createClient();

  const [config, setConfig] = useState({
    paystackPublicKey: "",
    paystackSecretKey: "",
    flutterwavePublicKey: "",
    flutterwaveSecretKey: "",
    flutterwaveSecretHash: "",
    preferredPaymentGateway: "paystack" as 'paystack' | 'flutterwave',
    googleMapsKey: "",
    custom_domain: "",
    fullName: "",
    email: "",
    logisticsBaseFee: "1500",
    logisticsPerKmFee: "250",
    lowStockThreshold: "5",
    automationAbandonedEnabled: true,
    automationLowStockEnabled: true,
    automationDigestEnabled: true,
    // Branding
    primaryColor: "#00798C",
    accentColor: "#10b981",
    fontFamily: "Inter",
    logoUrl: "",
    // Storefront
    heroTitle: "",
    heroSubtitle: "",
    storeDescription: ""
  });

  useEffect(() => {
    if (tenant) {
      setConfig({
        paystackPublicKey: tenant.business_config?.paystack_public_key || "",
        paystackSecretKey: tenant.business_config?.paystack_secret_key || "",
        flutterwavePublicKey: tenant.business_config?.flutterwave_public_key || "",
        flutterwaveSecretKey: tenant.business_config?.flutterwave_secret_key || "",
        flutterwaveSecretHash: tenant.business_config?.flutterwave_secret_hash || "",
        preferredPaymentGateway: (tenant.business_config?.preferred_payment_gateway as 'paystack' | 'flutterwave') || "paystack",
        googleMapsKey: tenant.business_config?.google_maps_key || "",
        custom_domain: tenant.custom_domain || "",
        fullName: userName || "",
        email: "",
        logisticsBaseFee: tenant.business_config?.logistics_base_fee || "1500",
        logisticsPerKmFee: tenant.business_config?.logistics_per_km_fee || "250",
        lowStockThreshold: tenant.business_config?.low_stock_threshold || "5",
        automationAbandonedEnabled: tenant.business_config?.automation_abandoned_enabled !== false,
        automationLowStockEnabled: tenant.business_config?.automation_low_stock_enabled !== false,
        automationDigestEnabled: tenant.business_config?.automation_digest_enabled !== false,
        // Branding
        primaryColor: tenant.branding_config?.primaryColor || "#00798C",
        accentColor: tenant.branding_config?.accentColor || "#10b981",
        fontFamily: tenant.branding_config?.fontFamily || "Inter",
        logoUrl: tenant.branding_config?.logoUrl || tenant.logo_url || "",
        // Storefront
        heroTitle: tenant.branding_config?.hero?.title || "",
        heroSubtitle: tenant.branding_config?.hero?.subtitle || "",
        storeDescription: tenant.description || ""
      });

      if (tenant.custom_domain) {
        DomainService.checkDomainConfiguration(tenant.custom_domain).then(setDomainStatus);
      }

      const base = (tenantName || "store").toLowerCase().replace(/[^a-z0-9]/g, '');
      setSuggestedDomains([
        `${base}.solosme.ng`,
        `${base}store.solosme.ng`,
        `${base}shop.solosme.ng`
      ]);
    }
  }, [tenant, userName, tenantName]);

  const handleSave = async () => {
    if (!tenantId) {
      toast.error("No merchant ID found. Please try logging in again.");
      return;
    }
    setSaving(true);
    setSaved(false);

    try {
      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          custom_domain: config.custom_domain,
          description: config.storeDescription,
          logo_url: config.logoUrl,
          branding_config: {
            ...tenant?.branding_config,
            primaryColor: config.primaryColor,
            accentColor: config.accentColor,
            fontFamily: config.fontFamily,
            logoUrl: config.logoUrl,
            hero: {
              title: config.heroTitle,
              subtitle: config.heroSubtitle
            }
          },
          business_config: {
            ...tenant?.business_config,
            paystack_public_key: config.paystackPublicKey,
            paystack_secret_key: config.paystackSecretKey,
            flutterwave_public_key: config.flutterwavePublicKey,
            flutterwave_secret_key: config.flutterwaveSecretKey,
            flutterwave_secret_hash: config.flutterwaveSecretHash,
            preferred_payment_gateway: config.preferredPaymentGateway,
            google_maps_key: config.googleMapsKey,
            logistics_base_fee: config.logisticsBaseFee,
            logistics_per_km_fee: config.logisticsPerKmFee,
            low_stock_threshold: config.lowStockThreshold,
            automation_abandoned_enabled: config.automationAbandonedEnabled,
            automation_low_stock_enabled: config.automationLowStockEnabled,
            automation_digest_enabled: config.automationDigestEnabled
          }
        })
        .eq('id', tenantId);

      if (updateError) throw updateError;

      // Update local context
      updateTenantState({
        custom_domain: config.custom_domain,
        description: config.storeDescription,
        logo_url: config.logoUrl,
        branding_config: {
          ...tenant?.branding_config,
          primaryColor: config.primaryColor,
          accentColor: config.accentColor,
          fontFamily: config.fontFamily,
          logoUrl: config.logoUrl,
          hero: {
            title: config.heroTitle,
            subtitle: config.heroSubtitle
          }
        },
        business_config: {
          ...tenant?.business_config,
          paystack_public_key: config.paystackPublicKey,
          paystack_secret_key: config.paystackSecretKey,
          flutterwave_public_key: config.flutterwavePublicKey,
          flutterwave_secret_key: config.flutterwaveSecretKey,
          flutterwave_secret_hash: config.flutterwaveSecretHash,
          preferred_payment_gateway: config.preferredPaymentGateway,
          google_maps_key: config.googleMapsKey,
          logistics_base_fee: config.logisticsBaseFee,
          logistics_per_km_fee: config.logisticsPerKmFee,
          low_stock_threshold: config.lowStockThreshold,
          automation_abandoned_enabled: config.automationAbandonedEnabled,
          automation_low_stock_enabled: config.automationLowStockEnabled,
          automation_digest_enabled: config.automationDigestEnabled
        }
      });

      setSaved(true);
      toast.success("System configurations synchronized successfully.");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save configurations");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!config.custom_domain) return;
    setVerifying(true);
    try {
      const status = await DomainService.checkDomainConfiguration(config.custom_domain);
      setDomainStatus(status);
      if (status.status === 'verified') {
        toast.success("Domain verified and connected!");
      } else {
        toast.error("Domain configuration incomplete.");
      }
    } catch (err) {
      toast.error("Verification connection failed.");
    } finally {
      setVerifying(false);
    }
  };

  const copyDomain = () => {
    const url = `${subdomain}.solosme.ng`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("URL copied to clipboard");
  };

  if (isTenantLoading) return <PageLoading />;
  if (!tenant) return <ErrorState message="Tenant configuration not found. Please refresh." onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings size={20} className="animate-spin-slow" />
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Institutional Config</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 text-sm font-medium">Coordinate your merchant identity, logistics, and intelligence lab.</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://${subdomain}.solosme.ng`}
            target="_blank"
            className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            View Storefront
            <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Elite Sidebar Nav */}
        <aside className="lg:w-72 shrink-0">
          <nav className="sticky top-6 space-y-2">
            <div className="px-4 py-2 mb-2">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Architecture</span>
            </div>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActive(s.id);
                    setSaved(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-3xl text-sm font-bold transition-all group relative overflow-hidden text-left",
                    on
                      ? "bg-white text-primary shadow-xl shadow-primary/5 border border-primary/20"
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                      on ? "bg-primary text-white shadow-lg shadow-primary/30 rotate-0" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:rotate-12"
                    )}>
                      <Icon size={20} />
                    </div>
                    {s.label}
                  </div>
                  {on && (
                    <div className="w-1.5 h-6 bg-primary rounded-full animate-in slide-in-from-right-full duration-500" />
                  )}
                  {on && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                  )}
                </button>
              );
            })}

            {/* Quick Actions / QR Code Mini */}
            <div className="mt-10 pt-10 border-t border-slate-100 px-4">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Sync Status</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Database</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Global Content Container */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 hover:border-slate-300 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 group/content relative min-h-[600px]">

            {/* Ambient background deco */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover/content:bg-primary/10 transition-colors" />

            <div className="p-10 relative z-10">
              {active === "domain" && (
                <DomainPanel
                  subdomain={subdomain || "mystore"}
                  customDomain={config.custom_domain}
                  setCustomDomain={(val) => setConfig({ ...config, custom_domain: val })}
                  verifying={verifying}
                  onVerify={handleVerifyDomain}
                  domainStatus={domainStatus}
                  suggestedDomains={suggestedDomains}
                  onCopy={copyDomain}
                  copied={copied}
                />
              )}

              {active === "branding" && (
                <BrandingPanel
                  config={config}
                  setConfig={setConfig}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                />
              )}

              {active === "storefront" && (
                <StorefrontPanel
                  config={config}
                  setConfig={setConfig}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                />
              )}

              {active === "account" && (
                <AccountPanel
                  config={config}
                  setConfig={setConfig}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                />
              )}

              {active === "logistics" && (
                <LogisticsPanel
                  config={config}
                  setConfig={setConfig}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                />
              )}

              {active === "automation" && (
                <AutomationPanel
                  config={config}
                  setConfig={setConfig}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                />
              )}

              {active === "integrations" && (
                <IntegrationPanel
                  config={config}
                  setConfig={setConfig}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                />
              )}
            </div>

            {/* Contextual Intelligence Overlay (Subtle) */}
            <div className="h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-30 mt-auto" />
          </div>

          {/* Quick Help / Support Footer */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between px-6 gap-4 opacity-30 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solo SME Vault v3.0</p>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
              <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary">Docs</button>
              <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary">API Ref</button>
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Institutional Grade Security Enabled</p>
          </div>
        </main>
      </div>
    </div>
  );
}
