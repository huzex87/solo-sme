'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './SalesAssistant.module.css';
import VoiceController from './VoiceController';

interface Message {
    id: string;
    text: string;
    isAi: boolean;
}

interface Product {
    name: string;
    price: number;
    category: string;
    description?: string;
}

interface SalesAssistantProps {
    businessName: string;
    products?: Product[];
}

export default function SalesAssistant({ businessName, products = [] }: SalesAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: `Hi there! 👋 I'm your AI assistant for ${businessName}. How can I help you today?`, isAi: true }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg = { id: Date.now().toString(), text: textToSend, isAi: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Build conversation history for multi-turn context
            const conversationHistory = messages.map(m => ({
                role: m.isAi ? 'model' : 'user',
                content: m.text,
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: textToSend,
                    businessName,
                    products,
                    conversationHistory,
                }),
            });

            const data = await response.json();
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm having trouble connecting right now.",
                isAi: true
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I encountered an error. Please try again later.",
                isAi: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceTranscript = (text: string) => {
        setInput(text);
        setTimeout(() => handleSend(text), 500);
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
                        <VoiceController
                            onTranscript={handleVoiceTranscript}
                            onStatusChange={(listening) => setIsListening(listening)}
                        />
                        <input
                            className={`input-field ${styles.input}`}
                            placeholder={isListening ? "Listening..." : "Ask a question..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSend()}
                            style={{ padding: '0.5rem 1rem' }}
                            disabled={isLoading || !input.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <button className={styles.fab} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
}
