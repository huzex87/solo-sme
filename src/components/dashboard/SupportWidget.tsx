import { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, X, Send, Loader2 } from 'lucide-react';
import styles from './SupportWidget.module.css';

export default function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1500);
    };

    return (
        <div className={styles.widgetWrapper}>
            <button
                className={styles.triggerBtn}
                onClick={() => setIsOpen(!isOpen)}
                title="Get Support"
            >
                {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>SOLO Support</h3>
                        <p>We&apos;re here to help you grow.</p>
                    </div>

                    {sent ? (
                        <div className={styles.successState}>
                            <div className={styles.successIcon}>✓</div>
                            <h4>Message Sent</h4>
                            <p>Our team will get back to you within 2 hours.</p>
                            <button className="btn btn-primary" onClick={() => { setSent(false); setIsOpen(false); }}>Close</button>
                        </div>
                    ) : (
                        <div className={styles.panelBody}>
                            <div className={styles.quickActions}>
                                <a href="https://wa.me/234" target="_blank" className={styles.actionItem}>
                                    <MessageCircle size={20} />
                                    <span>WhatsApp Support</span>
                                </a>
                                <div className={styles.actionItem}>
                                    <Mail size={20} />
                                    <span>Email Us</span>
                                </div>
                            </div>

                            <form className={styles.form} onSubmit={handleSubmit}>
                                <label>How can we help?</label>
                                <textarea placeholder="Describe your issue or request..." required />
                                <button type="submit" className={styles.sendBtn} disabled={loading}>
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Send Message</>}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
