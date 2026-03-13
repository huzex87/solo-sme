"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, Share2, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCodeCardProps {
    subdomain: string;
    businessName: string;
    primaryColor?: string;
    className?: string;
}

export function QRCodeCard({
    subdomain,
    businessName,
    primaryColor = "#0F766E",
    className
}: QRCodeCardProps) {
    const [qrUrl, setQrUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const storeUrl = `https://${subdomain}.solo.ng`; // Using the correct production pattern

    useEffect(() => {
        async function generateQR() {
            try {
                setLoading(true);
                // Generate for the internal state (data URL)
                const url = await QRCode.toDataURL(storeUrl, {
                    width: 600,
                    margin: 2,
                    color: {
                        dark: "#0F172A", // Slate 900 for high contrast
                        light: "#FFFFFF",
                    },
                    errorCorrectionLevel: 'H'
                });
                setQrUrl(url);
            } catch (err) {
                console.error("QR Generation failed", err);
            } finally {
                setLoading(false);
            }
        }
        generateQR();
    }, [storeUrl]);

    const downloadQR = () => {
        const link = document.createElement("a");
        link.download = `${subdomain}-store-qr.png`;
        link.href = qrUrl;
        link.click();
    };

    return (
        <div className={cn(
            "bg-white rounded-[32px] p-8 border border-slate-100 shadow-premium group transition-all hover:shadow-2xl",
            className
        )}>
            <div className="flex flex-col items-center gap-6">
                {/* Branded Header */}
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">{businessName}</h3>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        Storefront Access <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    </p>
                </div>

                {/* QR Container */}
                <div className="relative aspect-square w-48 bg-slate-50 rounded-3xl p-4 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                    {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    ) : (
                        <img
                            src={qrUrl}
                            alt="Store QR Code"
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={downloadQR}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                    >
                        <Download size={16} />
                        Download PNG
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => window.open(storeUrl, '_blank')}
                            className="flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            <ExternalLink size={14} />
                            Visit
                        </button>
                        <button
                            onClick={() => navigator.share?.({ title: businessName, url: storeUrl })}
                            className="flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            <Share2 size={14} />
                            Share
                        </button>
                    </div>
                </div>

                <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
                    Print this for your physical shop, packaging, or share it on social media.
                    Customers scan to shop instantly.
                </p>
            </div>
        </div>
    );
}
