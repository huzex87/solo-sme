'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/context/TenantContext';
import { ChatService, Conversation, Message } from '@/services/chatService';
import { supabase } from '@/lib/supabase';
import styles from './Hub.module.css';

export default function Hub() {
    const { tenantId, isLoading: isTenantLoading } = useTenant();
    const [threads, setThreads] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    const loadThreads = useCallback(async () => {
        if (isTenantLoading) return;
        if (!tenantId) {
            setLoading(false);
            return;
        }
        try {
            const data = await ChatService.getConversations(tenantId);
            setThreads(data);
            if (data.length > 0 && !activeId) {
                setActiveId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to load threads:', err);
        } finally {
            setLoading(false);
        }
    }, [tenantId, activeId]);

    const loadMessages = useCallback(async (id: string) => {
        try {
            const data = await ChatService.getMessages(id);
            setMessages(data);

            // Get AI Suggestion for the last message if it's from a customer
            const lastMsg = data[data.length - 1];
            if (lastMsg && lastMsg.sender === 'customer') {
                const suggestion = await ChatService.getAISuggestion(id, lastMsg.message);
                setAiSuggestion(suggestion);
            } else {
                setAiSuggestion(null);
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    }, []);

    useEffect(() => {
        loadThreads();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:chat_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages'
            }, () => {
                loadThreads();
                if (activeId) loadMessages(activeId);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadThreads, loadMessages, activeId]);

    useEffect(() => {
        if (activeId) {
            loadMessages(activeId);
        }
    }, [activeId, loadMessages]);

    const activeThread = threads.find(t => t.id === activeId);

    const handleSend = async () => {
        if (!inputValue || !activeId || !tenantId) return;

        const text = inputValue;
        setInputValue('');

        try {
            await ChatService.sendMessage(tenantId, activeId, text);
            await loadMessages(activeId);
            await loadThreads();
        } catch (err) {
            console.error('Failed to send message:', err);
            setInputValue(text); // Restore on failure
        }
    };

    const applyAI = () => {
        if (aiSuggestion) {
            setInputValue(aiSuggestion);
            setAiSuggestion(null);
        }
    };

    if (loading) return <div className={styles.loading}>Initializing Secure Hub...</div>;

    return (
        <div className={styles.hubContainer}>
            {/* Thread List */}
            <div className={styles.contactsList}>
                <div className={styles.listHeader}>
                    <h2 className={styles.listTitle}>Unified Hub</h2>
                    <div className={styles.tabs}>
                        <button className="btn btn-ghost btn-sm">All</button>
                        <button className="btn btn-ghost btn-sm">Unread</button>
                    </div>
                </div>
                <div className={styles.scrollArea}>
                    {threads.length === 0 ? (
                        <div className={styles.emptyPrompt}>No active conversations yet</div>
                    ) : (
                        threads.map(t => (
                            <div
                                key={t.id}
                                className={`${styles.contactItem} ${activeId === t.id ? styles.activeContact : ''}`}
                                onClick={() => setActiveId(t.id)}
                            >
                                <div className={styles.avatar}>{t.customer_name?.[0]}</div>
                                <div className={styles.contactInfo}>
                                    <div className={styles.topRow}>
                                        <span className={styles.name}>{t.customer_name}</span>
                                        <span className={styles.time}>
                                            {t.last_message_at ? new Date(t.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className={styles.preview}>{t.last_message}</p>
                                </div>
                                <span className={`${styles.channelBadge} badge badge-neutral`}>{t.channel}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat View */}
            <div className={styles.chatView}>
                {activeThread ? (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.headerInfo}>
                                <h3>{activeThread.customer_name}</h3>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                    Active on {activeThread.channel}
                                </p>
                            </div>
                            <div className={styles.headerActions}>
                                <button className="btn btn-ghost btn-sm">View Profile</button>
                            </div>
                        </div>

                        <div className={styles.messagesArea}>
                            {messages.map(m => (
                                <div key={m.id} className={`${styles.messageRow} ${m.sender === 'customer' ? styles.customerMessage : styles.ownerMessage}`}>
                                    <div className={`${styles.bubble} ${m.sender === 'customer' ? styles.customerBubble : styles.ownerBubble}`}>
                                        {m.message}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* AI Suggestion */}
                        {aiSuggestion && (
                            <div className={styles.aiPanel}>
                                <div className={styles.aiHeader}>
                                    <Sparkles size={16} className="text-secondary mr-2" />
                                    <span>AI Success Suggestion</span>
                                </div>
                                <p className={styles.aiText}>{aiSuggestion}</p>
                                <button className="btn btn-secondary btn-sm" onClick={applyAI}>Use Suggestion</button>
                            </div>
                        )}

                        {/* Input */}
                        <div className={styles.inputArea}>
                            <input
                                className={`input-field ${styles.inputField}`}
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className="btn btn-primary" onClick={handleSend}>Send</button>
                        </div>
                    </>
                ) : (
                    <div className={styles.noChatSelected}>
                        <Sparkles size={48} color="var(--accent-primary)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Importing icons here just for the empty state
import { Sparkles } from 'lucide-react';
