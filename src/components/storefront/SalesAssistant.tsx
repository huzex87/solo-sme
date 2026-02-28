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
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { id: Date.now().toString(), text: input, isAi: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, businessName }),
            });

            const data = await response.json();
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: data.response || "I'm having trouble connecting right now.", isAi: true }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error. Please try again later.", isAi: true }]);
        } finally {
            setIsLoading(false);
        }
    };

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
                        {isLoading && (
                            <div className={`${styles.msgRow} ${styles.aiMsg}`}>
                                <div className={`${styles.bubble} ${styles.aiBubble}`} style={{ padding: '0.4rem 0.8rem' }}>
                                    <span className={styles.dot}>.</span>
                                    <span className={styles.dot}>.</span>
                                    <span className={styles.dot}>.</span>
                                </div>
                            </div>
                        )}
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
