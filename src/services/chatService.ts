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

    static async createConversation(payload: {
        tenant_id: string;
        customer_id?: string;
        customer_name: string;
        channel: 'web' | 'whatsapp' | 'instagram' | 'email';
    }): Promise<Conversation | null> {
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                ...payload,
                last_message: 'Conversation started',
                last_message_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating conversation:', error);
            return null;
        }
        return data as Conversation;
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
        sender: 'customer' | 'owner' | 'ai' = 'owner'
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

        if (error) throw error;

        // Fetch conversation to get channel and customer ID for dispatching
        const { data: convData } = await supabase
            .from('conversations')
            .select('channel, customer_id')
            .eq('id', conversationId)
            .single();

        // Update conversation metadata
        await supabase
            .from('conversations')
            .update({
                last_message: text,
                last_message_at: new Date().toISOString()
            })
            .eq('id', conversationId);

        // Dispatch outgoing message to Meta APIs if applicable
        if (sender !== 'customer' && convData) {
            await this.dispatchToMeta(convData.channel, convData.customer_id, text);
        }

        return data;
    }

    /**
     * Dispatch message to external Meta APIs
     */
    private static async dispatchToMeta(channel: string, customerId: string, text: string) {
        const META_API_URL = 'https://graph.facebook.com/v19.0';
        const access_token = process.env.META_ACCESS_TOKEN;

        if (!access_token) {
            console.warn(`[ChatService] Missing META_ACCESS_TOKEN. Skipping dispatch to ${channel}.`);
            return;
        }

        try {
            if (channel === 'whatsapp') {
                const phoneNumberId = process.env.WHATSAPP_PHONE_ID; // Normally fetched from tenant settings
                await fetch(`${META_API_URL}/${phoneNumberId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: customerId,
                        type: 'text',
                        text: { body: text }
                    })
                });
            } else if (channel === 'instagram') {
                const pageId = process.env.IG_PAGE_ID; // Normally fetched from tenant settings
                await fetch(`${META_API_URL}/${pageId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipient: { id: customerId },
                        message: { text: text }
                    })
                });
            }
        } catch (error) {
            console.error(`[ChatService] Error dispatching to ${channel}:`, error);
        }
    }

    /**
     * Finds a conversation by customer ID or creates one.
     */
    static async findOrCreateConversation(tenantId: string, customerId: string, customerName: string, channel: 'whatsapp' | 'instagram' | 'web'): Promise<Conversation> {
        let { data } = await supabase
            .from('conversations')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('customer_id', customerId)
            .single();

        if (!data) {
            const newConv = await this.createConversation({ tenant_id: tenantId, customer_id: customerId, customer_name: customerName, channel });
            if (!newConv) throw new Error('Failed to create conversation');
            data = newConv;
        }
        return data as Conversation;
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
