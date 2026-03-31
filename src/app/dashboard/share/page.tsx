"use client";

import { useRef, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { QRCodeDisplay } from "@/components/storefront/QRCodeDisplay";
import { URLService } from "@/lib/url";
import {
  Share2, Copy, Check, Download, MessageCircle,
  ExternalLink, Instagram, Twitter, Facebook
} from "lucide-react";
import { toast } from "sonner";
import { PageLoading } from "@/components/ui/LoadingIndicator";
// html2canvas imported dynamically in handleDownloadFlyer

export default function ShareStorePage() {
  const { tenant, tenantName, subdomain, isLoading } = useTenant();
  const flyerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (isLoading) return <PageLoading />;

  const storeUrl = tenant ? URLService.getTenantPublicUrl(tenant) : `https://${subdomain}.solosme.ng`;
  const shortUrl = `${subdomain}.solosme.ng`;
  const logoUrl = tenant?.branding_config?.logoUrl || tenant?.logo_url;
  const primaryColor = tenant?.branding_config?.primaryColor || "#00798C";
  const waNumber = (tenant?.business_config?.whatsapp_number || tenant?.business_config?.phone || "").replace(/\D/g, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success("Store link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tenantName} - Shop Online`,
          text: `Check out ${tenantName}! Shop quality products online:`,
          url: storeUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadFlyer = async () => {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import for html2canvas
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default;
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${subdomain}-store-flyer.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Flyer downloaded!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to generate flyer");
    } finally {
      setDownloading(false);
    }
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`🛍️ Check out ${tenantName}!\n\nShop quality products online:\n${storeUrl}`)}`,
      "_blank"
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${tenantName}! 🛍️`)}&url=${encodeURIComponent(storeUrl)}`,
      "_blank"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-32 lg:pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white">
          <Share2 size={18} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">Share Your Store</h1>
          <p className="text-[11px] text-slate-500">Generate flyers, copy links, and spread the word</p>
        </div>
      </div>

      {/* Quick Copy Link */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Store Link</p>
          <p className="text-sm font-bold text-slate-900 truncate">{storeUrl}</p>
        </div>
        <button
          onClick={handleCopy}
          className="h-10 px-4 rounded-xl bg-slate-950 text-white flex items-center gap-2 text-sm font-bold active:scale-95 transition-all shrink-0"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Share Buttons */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Share to Social Media</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Share2 size={18} className="text-slate-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Share</span>
          </button>
          <button
            onClick={shareToWhatsApp}
            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-emerald-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
              <MessageCircle size={18} className="text-[#25D366]" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">WhatsApp</span>
          </button>
          <button
            onClick={() => {
              // WhatsApp Status: same as WhatsApp share — opens WhatsApp where user can post to Status
              window.open(
                `https://wa.me/?text=${encodeURIComponent(`🛍️ *${tenantName}* is now online!\n\nShop quality products:\n👉 ${storeUrl}\n\nOrder via WhatsApp or visit our store!`)}`,
                "_blank"
              );
            }}
            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-emerald-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-[#25D366] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Status</span>
          </button>
          <button
            onClick={() => {
              // Instagram: download flyer first, then prompt to share
              handleDownloadFlyer();
              toast.success("Flyer downloaded! Open Instagram and share to your Story or Feed.");
            }}
            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-pink-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <Instagram size={18} className="text-pink-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Instagram</span>
          </button>
          <button
            onClick={shareToTwitter}
            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-sky-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <Twitter size={18} className="text-sky-500" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Twitter/X</span>
          </button>
          <button
            onClick={shareToFacebook}
            className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-blue-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Facebook size={18} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Facebook</span>
          </button>
        </div>
      </div>

      {/* Downloadable Flyer Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Shareable Flyer</h2>
          <button
            onClick={handleDownloadFlyer}
            disabled={downloading}
            className="h-9 px-4 rounded-xl bg-slate-950 text-white flex items-center gap-2 text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
          >
            <Download size={14} />
            {downloading ? "Generating..." : "Download PNG"}
          </button>
        </div>

        {/* The actual flyer */}
        <div
          ref={flyerRef}
          className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, #f8fafc 50%, ${primaryColor}08 100%)` }}
        >
          <div className="p-8 sm:p-10 flex flex-col items-center text-center">
            {/* Store Logo & Name */}
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={tenantName || "Store Logo"}
                className="w-16 h-16 rounded-2xl object-cover mb-4 border-2 border-white shadow-md"
                crossOrigin="anonymous"
              />
            )}
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
              {tenantName}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Shop quality products online
            </p>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
              <QRCodeDisplay
                url={storeUrl}
                size={200}
                logoUrl={logoUrl}
                color={primaryColor}
                showActions={false}
              />
            </div>

            {/* Store URL */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-slate-200 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visit Us</p>
              <p className="text-sm font-bold" style={{ color: primaryColor }}>{shortUrl}</p>
            </div>

            {/* WhatsApp if available */}
            {waNumber && (
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <MessageCircle size={14} className="text-[#25D366]" />
                <span>WhatsApp: +{waNumber}</span>
              </div>
            )}

            {/* Powered by */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 w-full">
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                Powered by SOLO SME
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Live Store */}
      <a
        href={storeUrl}
        target="_blank"
        className="flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
      >
        <ExternalLink size={16} />
        View Live Store
      </a>
    </div>
  );
}
