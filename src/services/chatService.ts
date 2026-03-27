import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './baseService';
import { getBaseUrl } from '@/lib/baseUrl';

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

export class ChatService extends BaseService {
    static async getConversations(tenantId: string, client?: SupabaseClient): Promise<Conversation[]> {
        const supabase = this.getOrCreateClient(client);
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('last_message_at', { ascending: false });

        if (error) {
            this.logError('getConversations', error, { tenantId });
            return [];
        }

        return data as Conversation[];
    }

    static async createConversation(payload: {
        tenant_id: string;
        customer_id?: string;
        customer_name: string;
        channel: 'web' | 'whatsapp' | 'instagram' | 'email';
    }, client?: SupabaseClient): Promise<Conversation | null> {
        const supabase = this.getOrCreateClient(client);
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
            this.logError('createConversation', error, payload);
            return null;
        }
        return data as Conversation;
    }

    static async getMessages(conversationId: string, client?: SupabaseClient): Promise<Message[]> {
        const supabase = this.getOrCreateClient(client);
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            this.logError('getMessages', error, { conversationId });
            return [];
        }
        return data as Message[];
    }

    static async sendMessage(
        tenantId: string,
        conversationId: string,
        text: string,
        sender: 'customer' | 'owner' | 'ai' = 'owner',
        client?: SupabaseClient
    ) {
        const supabase = this.getOrCreateClient(client);

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

        if (error) {
            this.logError('sendMessage', error, { tenantId, conversationId });
            throw error;
        }

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
      await this.dispatchToMeta(tenantId, convData.channel, convData.customer_id, text);
    }

    return data;
  }

  /**
   * Dispatch message to external Meta APIs
   * Refactored to support Sovereign Multi-tenancy.
   */
  public static async dispatchToMeta(tenantId: string, channel: string, customerId: string, text: string) {
    try {
      if (channel === 'whatsapp') {
        const { WhatsAppService } = await import('./whatsappService');
        await WhatsAppService.sendText(customerId, text, tenantId);
      } else if (channel === 'instagram') {
        // Resolve Instagram credentials for this tenant
        const { createAdminClient } = await import('@/lib/supabase/server');
        const supabase = await createAdminClient();
        const { data: tenant } = await supabase
          .from('tenants')
          .select('business_config')
          .eq('id', tenantId)
          .single();

        const pageId = tenant?.business_config?.instagram_page_id || process.env.IG_PAGE_ID;
        const accessToken = tenant?.business_config?.meta_access_token || process.env.META_ACCESS_TOKEN;

        if (!pageId || !accessToken) return;

        const META_API_URL = 'https://graph.facebook.com/v19.0';
        await fetch(`${META_API_URL}/${pageId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient: { id: customerId },
            message: { text: text }
          })
        });
      }
    } catch (error) {
      this.logError('dispatchToMeta', error as Error, { tenantId, channel, customerId });
    }
  }

    /**
     * Finds a conversation by customer ID or creates one.
     */
    static async findOrCreateConversation(tenantId: string, customerId: string, customerName: string, channel: 'whatsapp' | 'instagram' | 'web', client?: SupabaseClient): Promise<Conversation> {
        const supabase = this.getOrCreateClient(client);

        let { data } = await supabase
            .from('conversations')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('customer_id', customerId)
            .single();

        if (!data) {
            const newConv = await this.createConversation({ tenant_id: tenantId, customer_id: customerId, customer_name: customerName, channel }, client);
            if (!newConv) throw new Error('Failed to create conversation');
            data = newConv;
        }
        return data as Conversation;
    }

    /**
     * Uses the SOLO AI Merchant Support engine to suggest a response.
     */
    static async getAISuggestion(conversationId: string, lastMessage: string): Promise<string> {
        const url = `${getBaseUrl()}/api/ai/chat-suggestion`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, lastMessage })
            });

            if (!response.ok) {
                return "Thank you for reaching out! A representative will be with you shortly.";
            }

            const data = await response.json();
            return data.suggestion;
        } catch (error) {
            this.logError('getAISuggestion', error as Error, { conversationId });
            return "Thank you for reaching out! A representative will be with you shortly.";
        }
    }
}
