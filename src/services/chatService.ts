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
            .select(`
                *,
                customers (
                    full_name
                )
            `)
            .eq('tenant_id', tenantId)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        return data.map(conv => ({
            ...conv,
            customer_name: conv.customers?.full_name || 'Anonymous Customer'
        }));
    }

    static async getMessages(conversationId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
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
                tenant_id: tenantId,
                conversation_id: conversationId,
                message: text,
                sender: sender
            })
            .select()
            .single();

        if (error) throw error;

        // Update conversation last message
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
     * Uses Gemini to suggest a response based on the conversation context.
     * In a real production app, we would include product catalog context here.
     */
    static async getAISuggestion(conversationId: string, lastMessage: string): Promise<string> {
        // This would eventually be a server action calling Gemini with RAG (Retrieval Augmented Generation) 
        // for the merchant's product list.
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (lastMessage.toLowerCase().includes('available')) {
            return "Yes, we have this item in stock! Would you like me to send a direct checkout link?";
        }

        return "Thank you for reaching out! One of our team members will be with you shortly, or I can help you find products right now.";
    }
}
