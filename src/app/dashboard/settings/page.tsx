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
  ChevronRight,
  ChevronLeft,
  Settings,
  User,
  CreditCard,
  Map,
  Loader2,
  Truck,
  Bell,
  Brain,
  Hash
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

function Field({
  label, placeholder, value = "", hint, disabled = false, type = "text", onChange
}: {
  label: string; placeholder?: string; value?: string;
  hint?: string; disabled?: boolean; type?: string;
  onChange?: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 text-sm rounded-xl outline-none transition-all font-medium",
          disabled
            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-white border border-slate-200 text-slate-900 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5",
          "placeholder-slate-300"
        )}
      />
      {hint && <p className="text-slate-400 text-[11px] font-medium ml-0.5">{hint}</p>}
    </div>
  );
}

function Toggle({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-slate-900">{label}</h4>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative outline-none ring-primary/20 focus:ring-4",
          enabled ? "bg-primary" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
          enabled ? "translate-x-6" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { tenantId, tenantName, subdomain, userName, tenant, isLoading: isTenantLoading, requiresOnboarding, updateTenantState } = useTenant();
  const [active, setActive] = useState<Section>("domain");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        preferredPaymentGateway: tenant.business_config?.preferred_payment_gateway || "paystack",
        googleMapsKey: tenant.business_config?.google_maps_key || "",
        custom_domain: tenant.custom_domain || "",
        fullName: userName || "",
        email: "", // Will be filled if needed or fetched once
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

      // Generate suggested domains
      const base = (tenantName || "store").toLowerCase().replace(/[^a-z0-9]/g, '');
      setSuggestedDomains([
        `${base}.solosme.ng`,
        `${base}store.solosme.ng`,
        `${base}shop.solosme.ng`
      ]);
    }
  }, [tenant, userName, isTenantLoading, tenantId, requiresOnboarding, router]);

  // Removed redundant fetchSettings effect as data is now provided by useTenant context

  const handleSave = async () => {
    if (!tenantId) {
      toast.error("No merchant ID found. Please try logging in again.");
      return;
    }
    setSaving(true);
    try {
      const { error: tenantError } = await supabase
        .from('tenants')
        .upsert({
          id: tenantId,
          name: tenantName === "Setting Up..." ? "My Business" : tenantName,
          subdomain: subdomain || "",
          custom_domain: config.custom_domain || null,
          business_config: {
            ...(tenant?.business_config || {}),
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
          },
          branding_config: {
            ...(tenant?.branding_config || {}),
            primaryColor: config.primaryColor,
            accentColor: config.accentColor,
            fontFamily: config.fontFamily,
            logoUrl: config.logoUrl,
            hero: {
              ...(tenant?.branding_config?.hero || {}),
              title: config.heroTitle,
              subtitle: config.heroSubtitle
            }
          },
          description: config.storeDescription,
          logo_url: config.logoUrl || tenant?.logo_url
        });

      const { data: { user } } = await supabase.auth.getUser();
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: config.fullName
        })
        .eq('id', user?.id);

      if (!tenantError && !profileError) {
        setSaved(true);
        toast.success("Settings updated successfully");
        setTimeout(() => setSaved(false), 2000);

        if (config.custom_domain && config.custom_domain !== tenant?.custom_domain) {
          const status = await DomainService.checkDomainConfiguration(config.custom_domain);
          setDomainStatus(status);
        }
      } else {
        toast.error("Failed to save changes");
      }
    } catch (e) {
      console.error("[Settings] Save error:", e);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!config.custom_domain) return;
    setVerifying(true);
    try {
      const check = await DomainService.checkDomainConfiguration(config.custom_domain);
      setDomainStatus(check);
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const copyDomain = () => {
    const domain = subdomain ? `${subdomain}.solosme.ng` : "mystore.solosme.ng";
    navigator.clipboard.writeText(domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isTenantLoading || loading) return <PageLoading />;

  if (error) {
    return (
      <div className="px-4">
        <ErrorState
          title="Settings Unavailable"
          message={error || "We're having trouble loading your configuration."}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your store configuration and security settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="lg:w-64 shrink-0 space-y-1">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const on = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  on
                    ? "bg-white text-primary shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  on ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                )}>
                  <Icon size={18} />
                </div>
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 hover:border-accent-border shadow-sm overflow-hidden min-w-0 transition-all duration-300">
          {/* Custom Domain Section */}
          {active === "domain" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Store Domain</h3>
                <p className="text-sm text-slate-500">Configure how customers access your store online.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Domain</label>
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <Globe size={18} className="text-slate-400" />
                      <span className="text-slate-900 text-sm font-medium flex-1">
                        {tenant?.subdomain}.solosme.ng
                      </span>
                      <button onClick={copyDomain} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    {suggestedDomains.length > 0 && !config.custom_domain && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Suggested for you</label>
                        <div className="flex flex-wrap gap-2">
                          {suggestedDomains.map((dom) => (
                            <button
                              key={dom}
                              onClick={() => setConfig({ ...config, custom_domain: dom })}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-primary hover:text-primary transition-all whitespace-nowrap"
                            >
                              {dom}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom Domain</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={config.custom_domain}
                        onChange={(e) => setConfig({ ...config, custom_domain: e.target.value })}
                        placeholder="e.g. store.yourbrand.com"
                        className="flex-1 px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder-slate-300 text-slate-900 font-medium shadow-sm"
                      />
                      <button
                        onClick={handleVerifyDomain}
                        disabled={verifying || !config.custom_domain}
                        className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm shrink-0 disabled:opacity-50"
                      >
                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect Domain"}
                      </button>
                    </div>

                    {domainStatus && (
                      <div className={cn(
                        "p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4",
                        domainStatus.status === 'verified' ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-100"
                      )}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              domainStatus.status === 'verified' ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"
                            )} />
                            <span className="text-sm font-bold text-slate-900">
                              {domainStatus.status === 'verified' ? "Domain Verified" : "Pending Configuration"}
                            </span>
                          </div>
                          <button
                            onClick={handleVerifyDomain}
                            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                          >
                            Refresh Status
                          </button>
                        </div>

                        {domainStatus.status !== 'verified' && (
                          <div className="space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Please add the following DNS records to your domain provider (GoDaddy, Namecheap, etc.) to verify ownership:
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="bg-white p-3 rounded-xl border border-amber-100 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Type: A Record</span>
                                  <span className="text-[10px] font-bold text-slate-400">Value: 76.76.21.21</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Type: CNAME</span>
                                  <span className="text-[10px] font-bold text-slate-400">Value: cname.solosme.ng</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 italic mt-2">
                              Note: DNS propagation can take up to 48 hours, but usually happens in minutes.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:pl-8 lg:border-l border-slate-100">
                  <QRCodeCard
                    subdomain={tenant?.subdomain || ""}
                    businessName={tenant?.name || ""}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    saved ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <div className="flex items-center gap-2"><Check size={16} /> Saved</div> : "Save Changes"}
                </button>
              </div>
            </div>
          )}
          {/* Store Branding Section */}
          {active === "branding" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Store Branding</h3>
                <p className="text-sm text-slate-500">Define your visual identity and how customers perceive your brand.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                        />
                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                          className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.accentColor}
                          onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                        />
                        <input
                          type="text"
                          value={config.accentColor}
                          onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                          className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Typography / Font Family</label>
                    <select
                      value={config.fontFamily}
                      onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm font-medium"
                    >
                      <option value="Inter">Inter (Premium Sans)</option>
                      <option value="'Outfit', sans-serif">Outfit (Modern & Clean)</option>
                      <option value="'Playfair Display', serif">Playfair (Luxury Serif)</option>
                      <option value="'JetBrains Mono', monospace">JetBrains (Technical & Precise)</option>
                    </select>
                  </div>

                  <Field
                    label="Store Logo URL"
                    placeholder="https://..."
                    value={config.logoUrl}
                    onChange={(val) => setConfig({ ...config, logoUrl: val })}
                    hint="SVG or PNG with transparent background recommended"
                  />
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Live Preview</h4>
                  <div className="aspect-video bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute top-4 left-4 flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    </div>
                    {config.logoUrl ? (
                      <img src={config.logoUrl} alt="Logo Preview" className="h-8 object-contain mb-4" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 mb-4 flex items-center justify-center">
                        <Palette size={16} className="text-slate-300" />
                      </div>
                    )}
                    <h5 className="text-sm font-bold text-slate-900" style={{ fontFamily: config.fontFamily }}>{tenantName}</h5>
                    <div className="mt-4 flex gap-2">
                      <div className="px-4 py-1.5 rounded-full text-[10px] font-bold text-white shadow-lg" style={{ backgroundColor: config.primaryColor }}>
                        Buy Now
                      </div>
                      <div className="px-4 py-1.5 rounded-full text-[10px] font-bold border border-slate-200" style={{ color: config.accentColor }}>
                        Details
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 text-center">This is an indicative preview of your store&apos;s primary aesthetic.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    saved ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <div className="flex items-center gap-2"><Check size={16} /> Saved</div> : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Storefront Content Section */}
          {active === "storefront" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Storefront Content</h3>
                <p className="text-sm text-slate-500">Manage the messaging and narrative on your public store homepage.</p>
              </div>

              <div className="space-y-6">
                <Field
                  label="Hero Title"
                  placeholder="The future of fashion is here"
                  value={config.heroTitle}
                  onChange={(val) => setConfig({ ...config, heroTitle: val })}
                  hint="The main headline shown to visitors"
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Hero Subtitle</label>
                  <textarea
                    value={config.heroSubtitle}
                    onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                    placeholder="Discover curated pieces crafted for the modern individual."
                    className="w-full px-4 py-3 text-sm bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm font-medium min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Store Description (SEO)</label>
                  <textarea
                    value={config.storeDescription}
                    onChange={(e) => setConfig({ ...config, storeDescription: e.target.value })}
                    placeholder="Supreme Fabrics is Nigeria's premier source for luxury textiles and bespoke attire..."
                    className="w-full px-4 py-3 text-sm bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm font-medium min-h-[120px] resize-none"
                  />
                  <p className="text-slate-400 text-[11px] font-medium ml-0.5">Used for search engines and social media sharing previews.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    saved ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <div className="flex items-center gap-2"><Check size={16} /> Saved</div> : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Account & Security Section */}
          {active === "account" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Profile & Security</h3>
                  <p className="text-sm text-slate-500">Manage your personal information and login credentials.</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                  <User size={20} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  label="Full Name"
                  placeholder="Your name"
                  value={config.fullName}
                  onChange={(val) => setConfig({ ...config, fullName: val })}
                />
                <Field
                  label="Email Address"
                  placeholder="your@email.com"
                  value={config.email}
                  onChange={(val) => setConfig({ ...config, email: val })}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900">Change Password</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Current Password" placeholder="••••••••" type="password" />
                  <Field label="New Password" placeholder="••••••••" type="password" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    saved ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <div className="flex items-center gap-2"><Check size={16} /> Saved</div> : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Logistics & Delivery Section */}
          {active === "logistics" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Logistics & Delivery</h3>
                  <p className="text-sm text-slate-500">Configure your delivery rates and mapping services.</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                  <Truck size={20} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  label="Base Delivery Fee (₦)"
                  placeholder="1500"
                  value={config.logisticsBaseFee}
                  onChange={(val) => setConfig({ ...config, logisticsBaseFee: val })}
                  hint="Initial fee applied to every delivery"
                />
                <Field
                  label="Fee Per KM (₦)"
                  placeholder="250"
                  value={config.logisticsPerKmFee}
                  onChange={(val) => setConfig({ ...config, logisticsPerKmFee: val })}
                  hint="Distance-based additional cost"
                />
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Map size={18} className="text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900">Google Maps Integration</h4>
                </div>
                <Field
                  label="Google Maps API Key"
                  placeholder="AIza..."
                  value={config.googleMapsKey}
                  onChange={(val) => setConfig({ ...config, googleMapsKey: val })}
                  hint="Required for precise distance-based quoting and address lookup"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    saved ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <div className="flex items-center gap-2"><Check size={16} /> Saved</div> : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Automation Lab Section */}
          {active === "automation" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Automation Lab</h3>
                  <p className="text-sm text-slate-500">Let AI handle routine tasks and keep your customers engaged.</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                  <Brain size={20} />
                </div>
              </div>

              <div className="space-y-4">
                <Toggle
                  label="Abandoned Cart Recovery"
                  description="Automatically send a recovery link when a customer leaves items in their cart."
                  enabled={config.automationAbandonedEnabled}
                  onChange={(val) => setConfig({ ...config, automationAbandonedEnabled: val })}
                />
                <Toggle
                  label="Low Stock Restock Alerts"
                  description="Get notified when an item falls below your defined threshold."
                  enabled={config.automationLowStockEnabled}
                  onChange={(val) => setConfig({ ...config, automationLowStockEnabled: val })}
                />
                <Toggle
                  label="Weekly Business Digest"
                  description="Receive a high-fidelity summary of your store's weekly performance."
                  enabled={config.automationDigestEnabled}
                  onChange={(val) => setConfig({ ...config, automationDigestEnabled: val })}
                />
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Hash size={18} className="text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900">Automation Thresholds</h4>
                </div>
                <div className="max-w-xs">
                  <Field
                    label="Low Stock Threshold"
                    placeholder="5"
                    value={config.lowStockThreshold}
                    onChange={(val) => setConfig({ ...config, lowStockThreshold: val })}
                    hint="Alerts trigger when stock falls below this number"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    saved ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <div className="flex items-center gap-2"><Check size={16} /> Saved</div> : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Integrations Section */}
          {active === "integrations" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">API Integrations</h3>
                  <p className="text-sm text-slate-500">Connect your own accounts for payments and advanced data syncing.</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                  <Zap size={20} />
                </div>
              </div>

              {/* Paystack Integration */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900">Payment Gateway Settings</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Preferred Gateway</label>
                    <select
                      value={config.preferredPaymentGateway}
                      onChange={(e) => setConfig({ ...config, preferredPaymentGateway: e.target.value as any })}
                      className="w-full px-4 py-3 text-sm bg-white border border-slate-200 text-slate-900 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm font-medium appearance-none"
                    >
                      <option value="paystack">Paystack (Recommended for Nigeria)</option>
                      <option value="flutterwave">Flutterwave (Best for Pan-African Expansion)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-8">
                  <CreditCard size={18} className="text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900">Paystack Settings</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field
                    label="Public Key"
                    placeholder="pk_live_..."
                    value={config.paystackPublicKey}
                    onChange={(val) => setConfig({ ...config, paystackPublicKey: val })}
                    hint="Found in your Paystack Dashboard"
                  />
                  <Field
                    label="Secret Key"
                    placeholder="sk_live_..."
                    type="password"
                    value={config.paystackSecretKey}
                    onChange={(val) => setConfig({ ...config, paystackSecretKey: val })}
                    hint="Keep this secure and confidential"
                  />
                </div>
              </div>

              {/* Flutterwave Integration */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900">Flutterwave Settings</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field
                    label="Public Key"
                    placeholder="FLWPUBK_..."
                    value={config.flutterwavePublicKey}
                    onChange={(val) => setConfig({ ...config, flutterwavePublicKey: val })}
                    hint="Found in your Flutterwave Dashboard"
                  />
                  <Field
                    label="Secret Key"
                    placeholder="FLWSECK_..."
                    type="password"
                    value={config.flutterwaveSecretKey}
                    onChange={(val) => setConfig({ ...config, flutterwaveSecretKey: val })}
                    hint="Required for transaction processing"
                  />
                  <Field
                    label="Secret Hash"
                    placeholder="Verif Hash"
                    type="password"
                    value={config.flutterwaveSecretHash}
                    onChange={(val) => setConfig({ ...config, flutterwaveSecretHash: val })}
                    hint="Configure this in your Flutterwave webhook setting"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                    saved ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <div className="flex items-center gap-2"><Check size={16} /> Saved</div> : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
