'use client';

import { useState, useEffect } from 'react';
import {
    MessageCircle, Copy, CheckCircle2, ExternalLink,
    Smartphone, Zap, BarChart3, Users, DollarSign,
    Package, Send, BookOpen, ShieldCheck, AlertCircle,
    Loader2, ArrowRight, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/context/TenantContext';
import styles from './whatsapp.module.css';

const SOLO_WA_NUMBER = '+234 XXX XXX XXXX'; // Replace after Meta onboarding

const COMMANDS = [
    { cmd: 'Record sale',      desc: 'Log any transaction instantly',      icon: DollarSign,   color: 'var(--accent-revenue)' },
    { cmd: 'Check stock',      desc: 'See inventory levels for any product', icon: Package,    color: 'var(--primary)' },
    { cmd: 'Daily summary',    desc: "Today's revenue, orders and insights", icon: BarChart3,  color: 'var(--accent-orders)' },
    { cmd: 'Send promo',       desc: 'Broadcast an offer to your customers', icon: Send,       color: 'var(--accent-marketing)' },
    { cmd: 'Business advice',  desc: 'Ask your AI coach anything',           icon: Zap,        color: 'var(--accent)' },
    { cmd: 'Check debts',      desc: 'See who owes you money',               icon: Users,      color: 'var(--accent-customers)' },
    { cmd: 'Add customer',     desc: 'Save a new customer to your records',  icon: Users,      color: 'var(--success)' },
    { cmd: 'Void sale',        desc: 'Cancel and reverse a recorded sale',   icon: AlertCircle,color: 'var(--danger)' },
];

const SETUP_STEPS = [
    {
        num: '1',
        title: 'Save our WhatsApp number',
        body: `Add ${SOLO_WA_NUMBER} to your phone contacts as "SOLO Business".`,
        tip: 'Make sure you save the full number with the country code.',
    },
    {
        num: '2',
        title: 'Send your link code',
        body: 'Open WhatsApp, find "SOLO Business", and send this exact message:',
        highlight: true, // shows the code inline
    },
    {
        num: '3',
        title: 'Enter the 6-digit OTP',
        body: 'SOLO will reply with a 6-digit verification code. Send that code back to complete linking.',
        tip: 'The code expires in 10 minutes.',
    },
    {
        num: '4',
        title: "You're live — say Menu",
        body: 'Send "Menu" to see everything you can do. Your AI business assistant is ready.',
        tip: 'You can use it in English, Hausa, or Pidgin.',
    },
];

export default function WhatsAppAIPage() {
    const { tenantId } = useTenant();
    const [linkCode, setLinkCode]   = useState<string>('—');
    const [enabled, setEnabled]     = useState(false);
    const [loading, setLoading]     = useState(true);
    const [copied, setCopied]       = useState(false);

    useEffect(() => {
        async function load() {
            if (!tenantId) return;
            try {
                const { data } = await supabase
                    .from('tenants')
                    .select('whatsapp_link_code, whatsapp_enabled')
                    .eq('id', tenantId)
                    .single();
                if (data) {
                    setLinkCode(data.whatsapp_link_code || '—');
                    setEnabled(data.whatsapp_enabled || false);
                }
            } catch {
                // fallback — code not yet in DB (migration pending)
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [tenantId]);

    const copy = () => {
        navigator.clipboard.writeText(`Link ${linkCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const waLink = `https://wa.me/${SOLO_WA_NUMBER.replace(/\D/g, '')}?text=Link+${linkCode}`;

    return (
        <div className={`${styles.page} animate-entrance`}>

            {/* ── PAGE HEADER ── */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.waIcon}>
                        <MessageCircle size={22} strokeWidth={1.8} />
                    </div>
                    <div>
                        <h1 className={styles.pageTitle}>WhatsApp AI Assistant</h1>
                        <p className={styles.pageSubtitle}>
                            Run your business by sending simple WhatsApp messages — no app needed.
                        </p>
                    </div>
                </div>
                <div className={`${styles.statusChip} ${enabled ? styles.statusActive : styles.statusInactive}`}>
                    <span className={styles.statusDot} />
                    {enabled ? 'Active & Linked' : 'Not Yet Linked'}
                </div>
            </div>

            {/* ── INTRO BANNER ── */}
            <div className={styles.introBanner}>
                <div className={styles.introBannerBg} />
                <div className={styles.introBannerContent}>
                    <p className={styles.introBannerText}>
                        Once linked, you can record sales, check inventory, send promotions, get financial reports,
                        and ask your AI business coach questions — all from WhatsApp, in plain language.
                    </p>
                    <div className={styles.introBannerFeatures}>
                        {['Works in English, Hausa & Pidgin', 'Available 24/7', 'No internet browser needed', 'Instant AI responses'].map(f => (
                            <div key={f} className={styles.introBannerFeature}>
                                <Check size={13} strokeWidth={3} />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* ── LEFT COLUMN: Setup ── */}
                <div className={styles.leftCol}>

                    {/* Link code card */}
                    <div className={styles.card}>
                        <div className={styles.cardHead}>
                            <div className={styles.cardTitle}>Your Link Code</div>
                            <div className={styles.cardSubtitle}>Keep this private — it connects your WhatsApp to your store</div>
                        </div>
                        {loading ? (
                            <div className={styles.codeLoading}>
                                <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />
                            </div>
                        ) : (
                            <>
                                <div className={styles.codeDisplay}>
                                    <span className={styles.codeText}>{linkCode}</span>
                                </div>
                                <div className={styles.codeActions}>
                                    <button onClick={copy} className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}>
                                        {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                                        {copied ? 'Copied "Link ' + linkCode + '"' : 'Copy Message to Send'}
                                    </button>
                                    <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.openWaBtn}>
                                        <MessageCircle size={15} />
                                        Open WhatsApp
                                        <ExternalLink size={12} style={{ opacity: .7 }} />
                                    </a>
                                </div>
                                <p className={styles.codeHint}>
                                    Tap "Copy Message" then paste it into WhatsApp, or tap "Open WhatsApp" to go directly.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Setup steps */}
                    <div className={styles.card}>
                        <div className={styles.cardHead}>
                            <div className={styles.cardTitle}>How to set it up</div>
                            <div className={styles.cardSubtitle}>Takes less than 2 minutes</div>
                        </div>
                        <div className={styles.steps}>
                            {SETUP_STEPS.map((s, i) => (
                                <div key={s.num} className={styles.step}>
                                    <div className={styles.stepLeft}>
                                        <div className={styles.stepNum}>{s.num}</div>
                                        {i < SETUP_STEPS.length - 1 && <div className={styles.stepLine} />}
                                    </div>
                                    <div className={styles.stepBody}>
                                        <div className={styles.stepTitle}>{s.title}</div>
                                        <p className={styles.stepDesc}>{s.body}</p>
                                        {s.highlight && (
                                            <div className={styles.stepCode}>
                                                Link {loading ? '…' : linkCode}
                                            </div>
                                        )}
                                        {s.tip && (
                                            <div className={styles.stepTip}>
                                                <ShieldCheck size={12} /> {s.tip}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Commands ── */}
                <div className={styles.rightCol}>
                    <div className={styles.card}>
                        <div className={styles.cardHead}>
                            <div className={styles.cardTitle}>What you can do</div>
                            <div className={styles.cardSubtitle}>Just type these in plain English on WhatsApp</div>
                        </div>
                        <div className={styles.commandGrid}>
                            {COMMANDS.map(c => (
                                <div key={c.cmd} className={styles.commandCard}>
                                    <div className={styles.commandIcon} style={{ background: c.color + '15', color: c.color }}>
                                        <c.icon size={16} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div className={styles.commandName}>{c.cmd}</div>
                                        <div className={styles.commandDesc}>{c.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className={`${styles.card} ${styles.tipsCard}`}>
                        <div className={styles.cardHead}>
                            <div className={styles.cardTitle}>Tips for best results</div>
                        </div>
                        <ul className={styles.tipsList}>
                            {[
                                'Say "Menu" at any time to see all available commands.',
                                'You can say "record a sale of ₦5,000 for shoes" in plain language.',
                                'Say "how is my business doing?" for an instant AI summary.',
                                'For promo broadcasts, make sure your customers have WhatsApp numbers saved.',
                                'Say "help" if you are stuck at any point.',
                            ].map(t => (
                                <li key={t} className={styles.tipItem}>
                                    <ArrowRight size={12} style={{ flexShrink: 0, color: 'var(--primary)', marginTop: 2 }} />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
