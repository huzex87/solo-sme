'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, X, Send, MessageSquare, Mic } from 'lucide-react';
import VoiceController from './VoiceController';
import styles from './SalesAssistant.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
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
        { role: 'assistant', content: `Hi there! 👋 I'm your AI assistant for ${businessName}. How can I help you today?` }
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

        const userMsg = textToSend.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/store-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    tenantName: businessName,
                    products: products.map(p => ({
                        name: p.name,
                        description: p.description,
                        price: p.price
                    }))
                })
            });

            const data = await response.json();
            if (data.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I&apos;m sorry, I&apos;m having a bit of trouble right now. Please try again later." }]);
            }
        } catch (error) {
            console.error("Assistant Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I&apos;m sorry, I encountered an error. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceTranscript = (text: string) => {
        setInput(text);
        setTimeout(() => handleSend(text), 500);
    };

    return (
        <div className={styles.assistantContainer}>
            {isOpen ? (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerTitle}>
                            <div className={styles.statusIndicator} />
                            <div>
                                <span className={styles.headerName}>{businessName}</span>
                                <p className={styles.headerSub}>AI Sales Assistant</p>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.messageArea} ref={scrollRef}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.assistantMessage}`}>
                                <div className={styles.typingIndicator}>
                                    <div className={styles.dot} />
                                    <div className={styles.dot} />
                                    <div className={styles.dot} />
                                </div>
                                <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: '8px' }}>Assistant is thinking...</span>
                            </div>
                        )}
                    </div>

                    {!isLoading && products.length > 0 && messages.length < 4 && (
                        <div className={styles.suggestionChips}>
                            {['What are your best sellers?', 'Tell me about your prices', 'Do you have new arrivals?'].map(chip => (
                                <button key={chip} className={styles.chip} onClick={() => handleSend(chip)}>
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={styles.inputArea}>
                        <VoiceController
                            onTranscript={handleVoiceTranscript}
                            onStatusChange={(listening) => setIsListening(listening)}
                        />
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={isListening ? "Listening..." : "Ask me anything..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <button className={styles.fab} onClick={() => setIsOpen(true)}>
                    <div className={styles.pulse} />
                    <Image
                        src="/brain/ac698879-4e07-47b6-9296-73298435a5b6/solo_ai_assistant_icon_1772472331365.png"
                        alt="AI"
                        width={60}
                        height={60}
                        className={styles.fabIcon}
                        style={{ borderRadius: '50%' }}
                    />
                </button>
            )}
        </div>
    );
}
