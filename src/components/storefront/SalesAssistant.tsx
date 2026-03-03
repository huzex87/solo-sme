'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import VoiceController from './VoiceController';
import styles from './SalesAssistant.module.css';
import { ChatService } from '@/services/chatService';

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
    tenantId: string;
    businessName: string;
    products?: Product[];
}

export default function SalesAssistant({ tenantId, businessName, products = [] }: SalesAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Hi there! 👋 I'm your AI assistant for ${businessName}. How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize conversation from localStorage
    useEffect(() => {
        const savedId = localStorage.getItem(`solo_conv_${tenantId}`);
        if (savedId) setConversationId(savedId);
    }, [tenantId]);

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
            let currentConvId = conversationId;

            // 1. Create conversation if it doesn't exist
            if (!currentConvId) {
                const newConv = await ChatService.createConversation({
                    tenant_id: tenantId,
                    customer_name: `Visitor (${new Date().toLocaleTimeString()})`,
                    channel: 'web'
                });
                if (newConv) {
                    currentConvId = newConv.id;
                    setConversationId(newConv.id);
                    localStorage.setItem(`solo_conv_${tenantId}`, newConv.id);
                }
            }

            // 2. Call AI Assistant API (which now handles persistence if convId exists)
            const response = await fetch('/api/ai/store-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    tenantName: businessName,
                    tenantId: tenantId,
                    conversationId: currentConvId,
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
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having a bit of trouble right now. Please try again later." }]);
            }
        } catch (error) {
            console.error("Assistant Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again later." }]);
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
                                <p className={styles.headerSub}>AI Sales Agent • Online</p>
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
                                className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.assistantRow}`}
                            >
                                <div className={styles.avatar}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.messageRow} ${styles.assistantRow}`}>
                                <div className={styles.avatar}><Bot size={14} /></div>
                                <div className={`${styles.message} ${styles.assistantMessage}`}>
                                    <div className={styles.typingIndicator}>
                                        <div className={styles.dot} />
                                        <div className={styles.dot} />
                                        <div className={styles.dot} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isLoading && messages.length < 5 && (
                        <div className={styles.suggestionChips}>
                            {['Tell me about your best products', 'How much does shipping cost?', 'Can I track my order?'].map(chip => (
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
                            placeholder={isListening ? "Listening..." : "How can we help?"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
                    <div className={styles.brandingFooter}>
                        Powered by <span>SOLO AI</span>
                    </div>
                </div>
            ) : (
                <button className={styles.fab} onClick={() => setIsOpen(true)}>
                    <div className={styles.pulse} />
                    <Sparkles className={styles.fabIcon} size={28} />
                </button>
            )}
        </div>
    );
}
