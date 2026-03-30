'use client';

import { BrandLogo } from '@/components/shared/BrandLogo';
import { Check, X } from 'lucide-react';

export default function BrandGuidePage() {
    return (
        <div className="min-h-screen bg-[#F0F4F8] text-[#072435] font-outfit pb-20">
            {/* Header / Nav */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-bottom border-[#E2E8F0] px-6 lg:px-12 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <BrandLogo size={32} showText={false} variant="light" />
                    <span className="font-extrabold text-lg tracking-tight">Identity Guide v1.0</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-[#64748B]">
                    <a href="#logo" className="hover:text-[#072435] transition-colors">Logo</a>
                    <a href="#colors" className="hover:text-[#072435] transition-colors">Colors</a>
                    <a href="#usage" className="hover:text-[#072435] transition-colors">Usage</a>
                    <a href="#typography" className="hover:text-[#072435] transition-colors">Typography</a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-[#072435] pt-24 pb-32 px-6 lg:px-12 relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_400px_at_50%_120%,rgba(20,184,166,0.15),transparent)] pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="inline-block text-[#14B8A6] text-[11px] font-bold tracking-[0.2em] uppercase mb-6">
                        SOLO SME Platform — Universal Visual System
                    </span>
                    <h1 className="text-white text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-8">
                        The Sovereign<br />
                        <span className="text-[#14B8A6]">Logo System</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto mb-12 font-medium">
                        A definitive guide to the SOLO SME brand identity. Standardizing visual excellence across every digital touchpoint and physical surface.
                    </p>

                    <div className="inline-flex items-center gap-6 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <BrandLogo size={80} showText={true} variant="dark" />
                    </div>
                </div>
            </section>

            {/* 01 — Logo Variations */}
            <section id="logo" className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
                <div className="mb-16">
                    <span className="text-[#0F766E] text-xs font-bold tracking-widest uppercase mb-2 block">01 — Logo System</span>
                    <h2 className="text-3xl font-black tracking-tight">Master Variations</h2>
                    <p className="text-[#64748B] mt-4 max-w-xl text-sm leading-relaxed">
                        The master lockup is the primary identifier. It combines the 3x3 Sovereign Dot mark with a high-weight Outfit wordmark.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Light Mode */}
                    <div className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-black/5 border border-[#E2E8F0] group">
                        <div className="h-48 bg-slate-50 flex items-center justify-center p-12 transition-colors group-hover:bg-white">
                            <BrandLogo variant="light" size={48} />
                        </div>
                        <div className="p-8 border-t border-[#E2E8F0]">
                            <h3 className="font-bold text-sm">Primary Light</h3>
                            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                                The standard version. Best for light backgrounds, white surfaces, and official documents.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-[#F0F4F8] rounded-full text-[#64748B]">Website</span>
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-[#F0F4F8] rounded-full text-[#64748B]">Marketing</span>
                            </div>
                        </div>
                    </div>

                    {/* Dark Mode */}
                    <div className="bg-[#072435] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 group">
                        <div className="h-48 bg-white/5 flex items-center justify-center p-12">
                            <BrandLogo variant="dark" size={48} />
                        </div>
                        <div className="p-8 border-t border-white/10">
                            <h3 className="font-bold text-sm text-white">Sovereign Dark</h3>
                            <p className="text-xs text-white/50 mt-2 leading-relaxed">
                                High intensity reversed mark. Optimized for dark dashboards, pitch decks, and hero sections.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 rounded-full text-white/60">SaaS App</span>
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 rounded-full text-white/60">Pitch Deck</span>
                            </div>
                        </div>
                    </div>

                    {/* Amber Edition */}
                    <div className="bg-[#FFFBEB] rounded-[32px] overflow-hidden shadow-xl border border-[#FEF3C7] group">
                        <div className="h-48 bg-[#FEF3C7]/30 flex items-center justify-center p-12">
                            <BrandLogo variant="amber" size={48} />
                        </div>
                        <div className="p-8 border-t border-[#FEF3C7]">
                            <h3 className="font-bold text-sm text-[#92400E]">Amber Accent</h3>
                            <p className="text-xs text-[#92400E]/70 mt-2 leading-relaxed">
                                Specialized campaign edition. Use for celebrations, launch announcements, and highlights.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-[#FEF3C7] rounded-full text-[#92400E]">Campaigns</span>
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-[#FEF3C7] rounded-full text-[#92400E]">Alerts</span>
                            </div>
                        </div>
                    </div>

                    {/* Monochrome Ink */}
                    <div className="bg-white rounded-[32px] overflow-hidden border border-[#E2E8F0]">
                        <div className="h-48 bg-slate-50 flex items-center justify-center p-12">
                            <BrandLogo variant="monochrome-ink" size={48} />
                        </div>
                        <div className="p-8 border-t border-[#E2E8F0]">
                            <h3 className="font-bold text-sm">Monochrome Ink</h3>
                            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                                Single color variant. For stamps, embossing, and high-contrast print surfaces.
                            </p>
                        </div>
                    </div>

                    {/* Monochrome White */}
                    <div className="bg-[#0F766E] rounded-[32px] overflow-hidden">
                        <div className="h-48 bg-black/5 flex items-center justify-center p-12">
                            <BrandLogo variant="monochrome-white" size={48} />
                        </div>
                        <div className="p-8 border-t border-white/10 text-white">
                            <h3 className="font-bold text-sm">Monochrome White</h3>
                            <p className="text-xs text-white/70 mt-2 leading-relaxed">
                                Pure white mark. For placement on brand-colored gradients or photographic backgrounds.
                            </p>
                        </div>
                    </div>

                    {/* Icon Only */}
                    <div className="bg-white rounded-[32px] overflow-hidden border border-[#E2E8F0]">
                        <div className="h-48 flex items-center justify-center p-12 gap-6">
                            <BrandLogo showText={false} size={54} variant="light" />
                            <BrandLogo showText={false} size={54} variant="dark" />
                        </div>
                        <div className="p-8 border-t border-[#E2E8F0]">
                            <h3 className="font-bold text-sm">Standalone Icon</h3>
                            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                                Standalone 2x2 grid mark. For profile photos, browser tabs, and compact UI.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 02 — Color Palette */}
            <section id="colors" className="bg-white py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="mb-16">
                        <span className="text-[#0F766E] text-xs font-bold tracking-widest uppercase mb-2 block">02 — Color Palette</span>
                        <h2 className="text-3xl font-black tracking-tight">Institutional Tones</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            { name: 'Deep Ink', hex: '#072435', role: 'Dominant Text & Fill', bg: 'bg-[#072435]', text: 'text-white' },
                            { name: 'Sovereign Teal', hex: '#0F766E', role: 'Primary Action Color', bg: 'bg-[#0F766E]', text: 'text-white' },
                            { name: 'Teal Light', hex: '#14B8A6', role: 'Highlights & Grids', bg: 'bg-[#14B8A6]', text: 'text-white' },
                            { name: 'Amber Gold', hex: '#F59E0B', role: 'The Focal Anchor', bg: 'bg-[#F59E0B]', text: 'text-white' },
                            { name: 'Surface', hex: '#F0F4F8', role: 'Secondary BG & Fills', bg: 'bg-[#F0F4F8]', text: 'text-[#072435]' }
                        ].map((color) => (
                            <div key={color.name} className="flex flex-col">
                                <div className={`h-32 rounded-2xl mb-4 shadow-inner ${color.bg}`} />
                                <h4 className="font-bold text-sm">{color.name}</h4>
                                <code className="text-xs text-[#64748B] font-mono mt-1">{color.hex}</code>
                                <p className="text-[10px] text-[#64748B] mt-2 leading-snug">{color.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 03 — Usage & Rules */}
            <section id="usage" className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
                <div className="mb-16">
                    <span className="text-[#0F766E] text-xs font-bold tracking-widest uppercase mb-2 block">03 — Usage Guide</span>
                    <h2 className="text-3xl font-black tracking-tight">Best Practices</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* The Do Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <h3 className="font-black text-lg">Use Correctly</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Always provide a clear space equal to the icon's height.",
                                "Ensure the Amber dot is always in the center (grid index 4).",
                                "Maintain the strict 800/600 font weight ratio.",
                                "Use the dark variant on all dark-mode dashboards."
                            ].map((text, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-green-100 flex gap-4 items-start shadow-sm">
                                    <span className="bg-green-50 text-green-600 font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-md shrink-0">{i + 1}</span>
                                    <p className="text-xs font-medium">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* The Don't Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <X size={14} strokeWidth={3} />
                            </div>
                            <h3 className="font-black text-lg">Avoid Misuse</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Never rotate or skew the mark.",
                                "Never use non-brand colors (e.g., standard blue or red).",
                                "Don't place on busy photographic backgrounds without an overlay.",
                                "Avoid resizing the wordmark disproportionally to the mark."
                            ].map((text, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-red-100 flex gap-4 items-start shadow-sm">
                                    <span className="bg-red-50 text-red-600 font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-md shrink-0">{i + 1}</span>
                                    <p className="text-xs font-medium">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#072435] py-20 px-6 lg:px-12 text-center border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <BrandLogo variant="dark" size={32} showText={true} className="justify-center mb-8" />
                    <p className="text-white/40 text-xs tracking-wide">
                        &copy; 2026 SOLO SME Platform. Designed by Huzex Lab.<br />
                        Abuja & Katsina, Nigeria.
                    </p>
                </div>
            </footer>
        </div>
    );
}
