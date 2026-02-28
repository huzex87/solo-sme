'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './SalesAssistant.module.css';

interface Message {
    id: string;
    text: string;
    isAi: boolean;
}

export default function SalesAssistant({ businessName }: { businessName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: `Hi there! I'm your AI assistant for ${businessName}. How can I help you today?`, isAi: true }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), text: input, isAi: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI Thinking
        await new Promise(r => setTimeout(r, 600));

        const aiResponse = getMockResponse(input);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponse, isAi: true }]);
    };

    const getMockResponse = (query: string): string => {
        const q = query.toLowerCase();
        if (q.includes('delivery') || q.includes('ship')) return "We deliver across Lagos in 24-48 hours. Nationwide shipping takes 3-5 business days.";
        if (q.includes('price') || q.includes('cost')) return "All our prices are listed on the product pages. Is there a specific item you're looking for?";
        if (q.includes('discount') || q.includes('promo')) return "We currently have a 10% discount for first-time shoppers! Use code SOLO10 at checkout.";
        return "I'm not sure I understand. Would you like to speak with a human agent? I can transfer this chat to the business owner.";
    }

    return (
        <div className={styles.widgetContainer}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-success)' }} />
                        <div className={styles.headerInfo}>
                            <h4>{businessName} Assistant</h4>
                            <p>Powered by SOLO Intelligence</p>
                        </div>
                    </div>

                    <div className={styles.messages} ref={scrollRef}>
                        {messages.map(m => (
                            <div key={m.id} className={`${styles.msgRow} ${m.isAi ? styles.aiMsg : styles.userMsg}`}>
                                <div className={`${styles.bubble} ${m.isAi ? styles.aiBubble : styles.userBubble}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            className={`input-field ${styles.input}`}
                            placeholder="Ask a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="btn btn-primary" onClick={handleSend} style={{ padding: '0.5rem 1rem' }}>Send</button>
                    </div>
                </div>
            )}

            <button className={styles.fab} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
}
