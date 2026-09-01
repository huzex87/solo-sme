"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Globe,
  Shield,
  ShoppingBag,
  Palette,
  Copy,
  Zap,
  Settings,
  Truck,
  Brain,
  Users,
  ExternalLink,
  Scale,
  ChevronDown,
  Banknote,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/context/TenantContext";
import { DomainService, DomainVerification } from "@/services/domainService";
import { SettingsConfig } from "@/types";
import { PageLoading } from "@/components/ui/LoadingIndicator";
import { ErrorState } from "@/components/ui/StatusStates";
import { toast } from "sonner";
import { AuditService } from "@/services/auditService";

// Modular Panel Imports
import { DomainPanel } from "@/components/dashboard/settings/DomainPanel";
import { BrandingPanel } from "@/components/dashboard/settings/BrandingPanel";
import { StorefrontPanel } from "@/components/dashboard/settings/StorefrontPanel";
import { IntegrationPanel } from "@/components/dashboard/settings/IntegrationPanel";
import { AccountPanel } from "@/components/dashboard/settings/AccountPanel";
import { LogisticsPanel } from "@/components/dashboard/settings/LogisticsPanel";
import { AutomationPanel } from "@/components/dashboard/settings/AutomationPanel";
import { StaffManagementPanel } from "@/components/dashboard/settings/StaffManagementPanel";
import { TaxPanel } from "@/components/dashboard/settings/TaxPanel";
import { PaymentPanel } from "@/components/dashboard/settings/PaymentPanel";
import { BillingPanel } from "@/components/dashboard/settings/BillingPanel";

type Section = "domain" | "branding" | "storefront" | "payment" | "billing" | "account" | "team" | "logistics" | "taxes" | "automation" | "integrations";

type SectionItem = { id: Section; label: string; icon: React.ElementType };

const BASIC_SECTIONS: SectionItem[] = [
  { id: "domain", label: "Domain", icon: Globe },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "storefront", label: "Storefront", icon: ShoppingBag },
  { id: "payment", label: "Payments", icon: Banknote },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "account", label: "Account", icon: Shield },
];

const ADVANCED_SECTIONS: SectionItem[] = [
  { id: "integrations", label: "Integrations", icon: Zap },
  { id: "logistics", label: "Delivery", icon: Truck },
  { id: "taxes", label: "Taxes", icon: Scale },
  { id: "automation", label: "Automation", icon: Brain },
  { id: "team", label: "Team", icon: Users },
];

const ALL_SECTIONS = [...BASIC_SECTIONS, ...ADVANCED_SECTIONS];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { tenantId, tenantName, subdomain, userName, tenant, isLoading: isTenantLoading, error: tenantError, updateTenantState } = useTenant();
  const tabParam = searchParams.get('tab') as Section | null;
  const [active, setActive] = useState<Section>(tabParam && ALL_SECTIONS.some(s => s.id === tabParam) ? tabParam : "domain");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [domainStatus, setDomainStatus] = useState<DomainVerification | null>(null);
  const [suggestedDomains, setSuggestedDomains] = useState<string[]>([]);

  // Auto-expand advanced section when an advanced tab is active
  useEffect(() => {
    if (ADVANCED_SECTIONS.some(s => s.id === active)) {
      setShowAdvanced(true);
    }
  }, [active]);

  const supabase = createClient();

  const [config, setConfig] = useState<SettingsConfig>({
    paystackPublicKey: "",
    paystackSecretKey: "",
    flutterwavePublicKey: "",
    flutterwaveSecretKey: "",
    flutterwaveSecretHash: "",
    preferredPaymentGateway: "paystack",
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
    primaryColor: "#00798C",
    accentColor: "#10b981",
    fontFamily: "Inter",
    logoUrl: "",
    heroTitle: "",
    heroSubtitle: "",
    storeDescription: "",
    whatsappPhoneId: "",
    whatsappAccessToken: "",
    whatsappWabaId: "",
    whatsappVerifyToken: "",
    paymentMethods: ["bank_transfer"],
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    whatsappCheckoutEnabled: true,
    themeStyle: "minimalist"
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
        primaryColor: tenant.branding_config?.primaryColor || "#00798C",
        accentColor: tenant.branding_config?.accentColor || "#10b981",
        fontFamily: tenant.branding_config?.fontFamily || "Inter",
        logoUrl: tenant.branding_config?.logoUrl || tenant.logo_url || "",
        heroTitle: tenant.branding_config?.hero?.title || "",
        heroSubtitle: tenant.branding_config?.hero?.subtitle || "",
        storeDescription: tenant.store_description || tenant.description || "",
        whatsappPhoneId: tenant.whatsapp_accounts?.find(a => a.is_default)?.phone_number_id || "",
        whatsappAccessToken: tenant.whatsapp_accounts?.find(a => a.is_default)?.access_token || "",
        whatsappWabaId: tenant.whatsapp_accounts?.find(a => a.is_default)?.waba_id || "",
        whatsappVerifyToken: tenant.whatsapp_accounts?.find(a => a.is_default)?.verify_token || "",
        paymentMethods: tenant.business_config?.payment_methods || ["bank_transfer"],
        bankName: tenant.business_config?.bank_name || "",
        bankAccountNumber: tenant.business_config?.bank_account_number || "",
        bankAccountName: tenant.business_config?.bank_account_name || "",
        whatsappCheckoutEnabled: tenant.business_config?.whatsapp_checkout_enabled !== false,
        themeStyle: tenant.branding_config?.themeStyle || "minimalist"
      });

      if (tenant.custom_domain) {
        DomainService.checkDomainConfiguration(tenant.custom_domain).then(setDomainStatus);
      }

      const businessName = tenant.name || tenantName || '';
      const base = businessName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      if (base && base !== subdomain) {
        setSuggestedDomains([
          `${base}.solosme.ng`,
          `${base}-store.solosme.ng`,
          `${base}-shop.solosme.ng`
        ]);
      } else {
        setSuggestedDomains([]);
      }
    }
  }, [tenant, userName, tenantName, subdomain]);

  const handleSave = async () => {
    if (!tenantId) {
      toast.error("No merchant ID found. Please try logging in again.");
      return;
    }

    // Guard against the common mistake of pasting the dialable phone number into
    // the Meta numeric-ID fields — that silently breaks WhatsApp sending. Meta's
    // Phone Number ID / WABA ID are long numeric identifiers from
    // WhatsApp → API Setup, never the phone number itself.
    const looksLikePhone = (v: string) => /^(?:0|234)?[789]\d{9}$/.test((v || "").replace(/\D/g, ""));
    if (config.whatsappPhoneId && looksLikePhone(config.whatsappPhoneId)) {
      toast.error("That Phone Number ID looks like a phone number. Paste the numeric Phone Number ID from Meta → WhatsApp → API Setup, not your dialable number.");
      return;
    }
    if (config.whatsappWabaId && looksLikePhone(config.whatsappWabaId)) {
      toast.error("That WABA ID looks like a phone number. Paste the WhatsApp Business Account ID from Meta → WhatsApp → API Setup.");
      return;
    }

    setSaving(true);
    setSaved(false);

    const oldData = {
      branding: { ...tenant?.branding_config },
      business: { ...tenant?.business_config },
      custom_domain: tenant?.custom_domain,
      description: tenant?.store_description || tenant?.description,
      logo_url: tenant?.logo_url
    };

    try {
      let subaccountCode = tenant?.business_config?.paystack_subaccount_code;

      const bankDetailsChanged = 
        config.bankName !== tenant?.business_config?.bank_name ||
        config.bankAccountNumber !== tenant?.business_config?.bank_account_number ||
        config.bankAccountName !== tenant?.business_config?.bank_account_name;

      if (config.paymentMethods?.includes('bank_transfer') && config.bankName && config.bankAccountNumber && config.bankAccountName) {
        if (!subaccountCode || bankDetailsChanged) {
          toast.loading("Provisioning Paystack subaccount...", { id: "subaccount-prov" });
          const subRes = await fetch('/api/payments/subaccount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenantId,
              bankName: config.bankName,
              accountNumber: config.bankAccountNumber,
              accountName: config.bankAccountName
            })
          });

          if (!subRes.ok) {
            const errData = await subRes.json();
            throw new Error(errData.error || 'Subaccount setup failed');
          }

          const subData = await subRes.json();
          subaccountCode = subData.subaccountCode;
          toast.success("Paystack subaccount successfully linked!", { id: "subaccount-prov" });
        }
      }

      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          store_description: config.storeDescription,
          logo_url: config.logoUrl,
          branding_config: {
            ...tenant?.branding_config,
            primaryColor: config.primaryColor,
            accentColor: config.accentColor,
            fontFamily: config.fontFamily,
            logoUrl: config.logoUrl,
            themeStyle: config.themeStyle,
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
            automation_digest_enabled: config.automationDigestEnabled,
            payment_methods: config.paymentMethods,
            bank_name: config.bankName,
            bank_account_number: config.bankAccountNumber,
            bank_account_name: config.bankAccountName,
            paystack_subaccount_code: subaccountCode,
            whatsapp_checkout_enabled: config.whatsappCheckoutEnabled
          }
        })
        .eq('id', tenantId);

      if (updateError) throw updateError;

      if (config.whatsappAccessToken && config.whatsappPhoneId) {
        const defaultAccount = tenant?.whatsapp_accounts?.find(a => a.is_default);
        const { error: waError } = await supabase
          .from('whatsapp_accounts')
          .upsert({
            id: defaultAccount?.id || undefined,
            tenant_id: tenantId,
            account_name: 'Primary WhatsApp',
            phone_number_id: config.whatsappPhoneId,
            access_token: config.whatsappAccessToken,
            waba_id: config.whatsappWabaId,
            verify_token: config.whatsappVerifyToken,
            is_default: true
          });
        if (waError) throw waError;
      }

      updateTenantState({
        description: config.storeDescription,
        store_description: config.storeDescription,
        logo_url: config.logoUrl,
        branding_config: {
          ...tenant?.branding_config,
          primaryColor: config.primaryColor,
          accentColor: config.accentColor,
          fontFamily: config.fontFamily,
          logoUrl: config.logoUrl,
          themeStyle: config.themeStyle,
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
          automation_digest_enabled: config.automationDigestEnabled,
          payment_methods: config.paymentMethods,
          bank_name: config.bankName,
          bank_account_number: config.bankAccountNumber,
          bank_account_name: config.bankAccountName,
          paystack_subaccount_code: subaccountCode,
          whatsapp_checkout_enabled: config.whatsappCheckoutEnabled
        }
      });

      setSaved(true);

      AuditService.logAction({
        tenant_id: tenantId,
        action: 'sync_settings_master',
        entity_type: 'config',
        entity_id: tenantId,
        metadata: {
          source: 'dashboard_settings',
          old: oldData,
          new: {
            branding: { ...tenant?.branding_config },
            business: { ...tenant?.business_config },
            custom_domain: config.custom_domain,
            description: config.storeDescription,
            store_description: config.storeDescription,
            logo_url: config.logoUrl
          }
        }
      });

      toast.success("Settings saved successfully.");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      toast.error((err as Error).message || "Failed to save settings");
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
        toast.error("Domain not yet configured. Check DNS records.");
      }
    } catch {
      toast.error("Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const activeDomain = domainStatus?.status === 'verified' && config.custom_domain
    ? config.custom_domain
    : `${subdomain}.solosme.ng`;

  const copyDomain = () => {
    navigator.clipboard.writeText(activeDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Store URL copied");
  };

  if (isTenantLoading) return <PageLoading />;
  if (tenantError || !tenant) return <ErrorState message={tenantError || "Tenant not found. Please refresh."} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-6xl mx-auto pb-36 lg:pb-12 animate-entrance">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white">
            <Settings size={18} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-950 tracking-tight">Settings</h1>
            <p className="text-[11px] md:text-xs text-slate-500">Configure your store</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyDomain}
            className="h-8 md:h-9 px-2.5 md:px-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 transition-all flex items-center gap-1.5 text-[11px] md:text-xs font-medium active:scale-95"
          >
            <span className="hidden sm:inline truncate max-w-[140px]">{copied ? "Copied!" : activeDomain}</span>
            <Copy size={13} />
          </button>
          <a
            href={`https://${activeDomain}`}
            target="_blank"
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-950 text-white flex items-center justify-center hover:bg-primary transition-colors active:scale-95"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Mobile Section Tabs */}
      <div className="lg:hidden space-y-2 pb-4">
        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 scrollbar-none">
          {BASIC_SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => { setActive(s.id); setSaved(false); setShowAdvanced(false); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
                  active === s.id && !showAdvanced
                    ? "bg-slate-950 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                <Icon size={13} />
                {s.label}
              </button>
            );
          })}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
              showAdvanced || ADVANCED_SECTIONS.some(s => s.id === active)
                ? "bg-slate-950 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            <Settings size={13} />
            Advanced
            <ChevronDown size={12} className={cn("transition-transform", showAdvanced && "rotate-180")} />
          </button>
        </div>
        {showAdvanced && (
          <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 scrollbar-none">
            {ADVANCED_SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setSaved(false); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
                    active === s.id
                      ? "bg-slate-950 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Icon size={13} />
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block">
          <nav className="sticky top-6 space-y-0.5">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Basic</p>
            {BASIC_SECTIONS.map((s) => {
              const Icon = s.icon;
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setSaved(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                    on
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon size={16} className={on ? "text-white" : "text-slate-400"} />
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-3 pb-1"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Advanced</p>
                <ChevronDown size={12} className={cn("text-slate-400 transition-transform", showAdvanced && "rotate-180")} />
              </button>
              {showAdvanced && (
                <div className="space-y-0.5 mt-1">
                  {ADVANCED_SECTIONS.map((s) => {
                    const Icon = s.icon;
                    const on = active === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setActive(s.id); setSaved(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                          on
                            ? "bg-slate-950 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <Icon size={16} className={on ? "text-white" : "text-slate-400"} />
                        <span className="text-sm font-medium">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 px-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400">Store active</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-[500px]">
            <div className="p-6 md:p-8">
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
                  tenantId={tenantId}
                  tenantName={tenantName}
                  onSubdomainChange={(newSub) => {
                    updateTenantState({ subdomain: newSub });
                  }}
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

              {active === "payment" && (
                <PaymentPanel
                  config={config}
                  setConfig={setConfig}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                />
              )}

              {active === "billing" && (
                <BillingPanel />
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

              {active === "team" && (
                <StaffManagementPanel tenantId={tenantId} />
              )}

              {active === "logistics" && (
                <LogisticsPanel
                  config={config}
                  setConfig={setConfig}
                  onSave={handleSave}
                  saving={saving}
                  saved={saved}
                  tenantId={tenantId}
                  city={tenant?.business_config?.address?.includes('Lagos') ? 'Lagos' : 'Katsina'}
                />
              )}

              {active === "taxes" && (
                <TaxPanel tenantId={tenantId} />
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
                  tenantId={tenantId}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
