import { supabase } from '@/lib/supabase';

export interface Message {
    id: string;
    conversation_id: string;
    sender: 'customer' | 'owner' | 'ai';
    message: string;
    created_at: string;
    is_read: boolean;
}

export interface Conversation {
    id: string;
    tenant_id: string;
    customer_id: string;
    channel: 'web' | 'whatsapp' | 'instagram' | 'email';
    last_message: string;
    last_message_at: string;
    unread_count: number;
    customer_name?: string;
}

export class ChatService {
    static async getConversations(tenantId: string): Promise<Conversation[]> {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('last_message_at', { ascending: false });

        if (error) return [];

        return data as Conversation[];
    }

    static async getMessages(conversationId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) return [];
        return data as Message[];
    }

    static async sendMessage(
        tenantId: string,
        conversationId: string,
        text: string,
        sender: 'owner' | 'ai' = 'owner'
    ) {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                conversation_id: conversationId,
                tenant_id: tenantId,
                message: text,
                sender: sender
            })
            .select()
            .single();

        if (error) throw error;

        // Update conversation metadata
        await supabase
            .from('conversations')
            .update({
                last_message: text,
                last_message_at: new Date().toISOString()
            })
            .eq('id', conversationId);

        return data;
    }

    /**
     * Uses the SOLO AI Intelligence engine to suggest a response.
     */
    static async getAISuggestion(conversationId: string, lastMessage: string): Promise<string> {
        const response = await fetch('/api/ai/chat-suggestion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId, lastMessage })
        });

        if (!response.ok) {
            return "Thank you for reaching out! A representative will be with you shortly.";
        }

        const data = await response.json();
        return data.content;
    }
}
