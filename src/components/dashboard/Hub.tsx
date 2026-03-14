'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, MessageSquare, Search, Filter, MoreVertical, Send, User } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { ChatService, Conversation, Message } from '@/services/chatService';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

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
            logger.error('Failed to load chat threads', err);
        } finally {
            setLoading(false);
        }
    }, [tenantId, activeId, isTenantLoading]);

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
            logger.error('Failed to load chat messages', err);
        }
    }, []);

    useEffect(() => {
        loadThreads();

        const supabase = createClient();
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
            logger.error('Failed to send chat message', err);
            setInputValue(text); // Restore on failure
        }
    };

    const applyAI = () => {
        if (aiSuggestion) {
            setInputValue(aiSuggestion);
            setAiSuggestion(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Connecting to Inbox...</p>
            </div>
        );
    }

    return (
        <div className="flex bg-white border border-border rounded-[32px] overflow-hidden h-[calc(100vh-180px)] min-h-[550px] shadow-premium relative">
            <div className="absolute inset-0 bg-mesh opacity-[0.03] pointer-events-none" />
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/20">
                <div className="p-5 border-b border-slate-100 bg-white">
                    <h2 className="text-base font-bold text-slate-900 mb-4 tracking-tight">Inbox</h2>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-none">
                    {threads.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            No conversations yet
                        </div>
                    ) : (
                        threads.map(t => (
                            <div
                                key={t.id}
                                onClick={() => setActiveId(t.id)}
                                className={cn(
                                    "p-5 border-b border-slate-50 cursor-pointer transition-all flex gap-4 relative group",
                                    activeId === t.id ? "bg-white shadow-soft-md shadow-slate-200/40 z-10" : "hover:bg-slate-50/80"
                                )}
                            >
                                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-600 text-xs shadow-sm capitalize">
                                    {t.customer_name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-sm font-bold text-slate-900 truncate tracking-tight">{t.customer_name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                                            {t.last_message_at ? new Date(t.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate font-medium">{t.last_message}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[9px] py-0.5 px-2 bg-slate-100 text-slate-500 rounded-lg uppercase font-bold tracking-widest">{t.channel}</span>
                                    </div>
                                </div>
                                {activeId === t.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {activeThread ? (
                    <>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <User size={18} className="text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{activeThread.customer_name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        {activeThread.channel} Channel
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scrollbar-none">
                            {messages.map(m => (
                                <div key={m.id} className={cn(
                                    "flex flex-col",
                                    m.sender === 'customer' ? "items-start" : "items-end"
                                )}>
                                    <div className={cn(
                                        "max-w-[80%] px-5 py-3.5 rounded-2xl text-[13px] font-semibold leading-relaxed transition-all",
                                        m.sender === 'customer'
                                            ? "bg-white border border-border text-slate-900 rounded-tl-sm shadow-soft-sm"
                                            : "bg-slate-950 text-white rounded-tr-sm shadow-soft-md shadow-slate-900/10"
                                    )}>
                                        {m.message}
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-1">
                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Footer / Input */}
                        <div className="p-5 border-t border-slate-100 space-y-3 bg-white">
                            {/* AI Suggestion */}
                            {aiSuggestion && (
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-2">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                                        <Sparkles size={16} className="animate-pulse" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                            AI Smart Reply
                                        </p>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic truncate">&quot;{aiSuggestion}&quot;</p>
                                    </div>
                                    <button
                                        onClick={applyAI}
                                        className="px-4 py-1.5 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md shadow-primary/20 self-center"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium placeholder:text-slate-400"
                                />
                                <button
                                    onClick={handleSend}
                                    className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-lg shadow-slate-900/20 active:scale-90"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
                        <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                            <MessageSquare size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Select a conversation</h3>
                        <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto mb-8 font-medium leading-relaxed">
                            Pick a customer on the left to start chatting. You can use AI smart replies to respond faster.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// No extra imports needed
