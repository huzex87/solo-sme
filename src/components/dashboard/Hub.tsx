'use client';

import { useState } from 'react';
import styles from './Hub.module.css';

interface Message {
    id: string;
    text: string;
    isFromCustomer: boolean;
    timestamp: string;
}

interface Thread {
    id: string;
    name: string;
    channel: 'whatsapp' | 'instagram' | 'web';
    lastMessage: string;
    time: string;
    messages: Message[];
    aiSuggestion?: string;
}

const MOCK_THREADS: Thread[] = [
    {
        id: 't1',
        name: 'Adaeze Okonkwo',
        channel: 'whatsapp',
        lastMessage: 'Is the Midnight Silk Scarf still available?',
        time: '12:30 PM',
        messages: [
            { id: 'm1', text: 'Hi! I saw your store on Instagram.', isFromCustomer: true, timestamp: '12:28 PM' },
            { id: 'm2', text: 'Is the Midnight Silk Scarf still available?', isFromCustomer: true, timestamp: '12:30 PM' },
        ],
        aiSuggestion: 'Yes, it is! We have 5 units left in stock. Would you like me to send you a direct payment link?'
    },
    {
        id: 't2',
        name: 'Chidi Nnamdi',
        channel: 'instagram',
        lastMessage: 'Love the new collection!',
        time: 'Yesterday',
        messages: [
            { id: 'm3', text: 'Love the new collection!', isFromCustomer: true, timestamp: 'Yesterday' },
        ]
    },
    {
        id: 't3',
        name: 'Anonymous (Storefront)',
        channel: 'web',
        lastMessage: 'What are your delivery times for Lagos?',
        time: 'Feb 26',
        messages: [
            { id: 'm4', text: 'What are your delivery times for Lagos?', isFromCustomer: true, timestamp: 'Feb 26' },
        ],
        aiSuggestion: 'Generally, we deliver within 24-48 hours within Lagos. Nationwide shipping takes 3-5 business days.'
    }
];

export default function Hub() {
    const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
    const [activeId, setActiveId] = useState(MOCK_THREADS[0].id);
    const [inputValue, setInputValue] = useState('');

    const activeThread = threads.find(t => t.id === activeId)!;

    const handleSend = () => {
        if (!inputValue) return;
        const newMessage: Message = {
            id: `m${Date.now()}`,
            text: inputValue,
            isFromCustomer: false,
            timestamp: 'Just now'
        };

        setThreads(prev => prev.map(t =>
            t.id === activeId ? { ...t, messages: [...t.messages, newMessage], lastMessage: inputValue, time: 'Just now' } : t
        ));
        setInputValue('');
    };

    const applyAI = () => {
        if (activeThread.aiSuggestion) {
            setInputValue(activeThread.aiSuggestion);
        }
    };

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
                    {threads.map(t => (
                        <div
                            key={t.id}
                            className={`${styles.contactItem} ${activeId === t.id ? styles.activeContact : ''}`}
                            onClick={() => setActiveId(t.id)}
                        >
                            <div className={styles.avatar}>{t.name[0]}</div>
                            <div className={styles.contactInfo}>
                                <div className={styles.topRow}>
                                    <span className={styles.name}>{t.name}</span>
                                    <span className={styles.time}>{t.time}</span>
                                </div>
                                <p className={styles.preview}>{t.lastMessage}</p>
                            </div>
                            <span className={`${styles.channelBadge} badge badge-neutral`}>{t.channel}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat View */}
            <div className={styles.chatView}>
                <div className={styles.chatHeader}>
                    <div className={styles.headerInfo}>
                        <h3>{activeThread.name}</h3>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            Active on {activeThread.channel}
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className="btn btn-ghost btn-sm">View Profile</button>
                    </div>
                </div>

                <div className={styles.messagesArea}>
                    {activeThread.messages.map(m => (
                        <div key={m.id} className={`${styles.messageRow} ${m.isFromCustomer ? styles.customerMessage : styles.ownerMessage}`}>
                            <div className={`${styles.bubble} ${m.isFromCustomer ? styles.customerBubble : styles.ownerBubble}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Suggestion */}
                {activeThread.aiSuggestion && (
                    <div className={styles.aiPanel}>
                        <div className={styles.aiHeader}>
                            <span>✨ AI Success Suggestion</span>
                        </div>
                        <p className={styles.aiText}>{activeThread.aiSuggestion}</p>
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
            </div>
        </div>
    );
}
