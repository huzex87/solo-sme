import redis from '@/lib/redis';
import { WhatsAppService } from './whatsappService';
import { TenantService } from './tenantService';
import { WhatsAppAuthService } from './whatsappAuthService';
import { ProductService } from './productService';
import { logger } from '@/lib/logger';

export type OnboardingState = 'IDLE' | 'AWAITING_NAME' | 'AWAITING_INDUSTRY' | 'AWAITING_SUBDOMAIN' | 'AWAITING_CONFIRMATION' | 'COMPLETED';

export interface OnboardingSession {
    state: OnboardingState;
    businessName?: string;
    industry?: string;
    subdomain?: string;
    lastUpdated: number;
}

export class WhatsAppOnboardingService {
    private static SESSION_TTL = 3600; // 1 hour

    static async handleMessage(phoneNumber: string, text: string) {
        const session = await this.getSession(phoneNumber);

        switch (session.state) {
            case 'IDLE':
                return this.startOnboarding(phoneNumber);
            case 'AWAITING_NAME':
                return this.handleNameInput(phoneNumber, session, text);
            case 'AWAITING_INDUSTRY':
                return this.handleIndustryInput(phoneNumber, session, text);
            case 'AWAITING_SUBDOMAIN':
                return this.handleSubdomainInput(phoneNumber, session, text);
            case 'AWAITING_CONFIRMATION':
                return this.handleConfirmation(phoneNumber, session, text);
            default:
                return this.startOnboarding(phoneNumber);
        }
    }

    private static async getSession(phoneNumber: string): Promise<OnboardingSession> {
        const cached = await redis.get(`whatsapp:onboarding:${phoneNumber}`);
        if (cached) return cached as OnboardingSession;
        return { state: 'IDLE', lastUpdated: Date.now() };
    }

    private static async saveSession(phoneNumber: string, session: OnboardingSession) {
        session.lastUpdated = Date.now();
        await redis.set(`whatsapp:onboarding:${phoneNumber}`, session, { ex: this.SESSION_TTL });
    }

    private static async startOnboarding(phoneNumber: string) {
        const message = "Welcome to SOLO SME! 🚀\n\nI don't recognize this number. Would you like to set up a professional online store for your business right here in 2 minutes?\n\nTo begin, what is your *Business Name*?";
        await this.saveSession(phoneNumber, { state: 'AWAITING_NAME', lastUpdated: Date.now() });
        return WhatsAppService.sendText(phoneNumber, message);
    }

    private static async handleNameInput(phoneNumber: string, session: OnboardingSession, text: string) {
        const name = text.trim();
        if (name.length < 3) {
            return WhatsAppService.sendText(phoneNumber, "That seems a bit short. Please type your full Business Name:");
        }

        session.businessName = name;
        session.state = 'AWAITING_INDUSTRY';
        await this.saveSession(phoneNumber, session);

        const message = `Got it! *${name}* sounds great.\n\nWhich industry are you in? (e.g., Fashion, Food, Electronics, Services)`;
        return WhatsAppService.sendText(phoneNumber, message);
    }

    private static async handleIndustryInput(phoneNumber: string, session: OnboardingSession, text: string) {
        session.industry = text.trim();
        session.state = 'AWAITING_SUBDOMAIN';
        await this.saveSession(phoneNumber, session);

        const suggestion = session.businessName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-store';
        const message = `Excellent. Now, let's choose your store web address.\n\nType your preferred subdomain (e.g., *${suggestion}*). Your store will be at *${suggestion}.solo-sme.com*`;
        return WhatsAppService.sendText(phoneNumber, message);
    }

    private static async handleSubdomainInput(phoneNumber: string, session: OnboardingSession, text: string) {
        const subdomain = text.toLowerCase().replace(/[^a-z0-9-]/g, '');

        if (subdomain.length < 3) {
            return WhatsAppService.sendText(phoneNumber, "Subdomain must be at least 3 characters. Try again:");
        }

        // Check availability
        const isAvailable = await TenantService.getTenantBySubdomain(subdomain) === null;
        if (!isAvailable) {
            return WhatsAppService.sendText(phoneNumber, `Sorry, *${subdomain}* is already taken. Try another name:`);
        }

        session.subdomain = subdomain;
        session.state = 'AWAITING_CONFIRMATION';
        await this.saveSession(phoneNumber, session);

        const message = `Checking availability... *${subdomain}.solo-sme.com* is available! ✅\n\nReady to launch *${session.businessName}*?\n\nReply *YES* to create your store now!`;
        return WhatsAppService.sendText(phoneNumber, message);
    }

    private static async handleConfirmation(phoneNumber: string, session: OnboardingSession, text: string) {
        const input = text.toUpperCase().trim();
        if (['YES', 'Y', 'CONFIRM', 'OK'].includes(input)) {
            return this.finalizeOnboarding(phoneNumber, session);
        } else if (['NO', 'N', 'CANCEL'].includes(input)) {
            await redis.del(`whatsapp:onboarding:${phoneNumber}`);
            return WhatsAppService.sendText(phoneNumber, "No problem! We've cancelled the setup. Message me anytime if you change your mind.");
        } else {
            return WhatsAppService.sendText(phoneNumber, "Please reply *YES* to confirm or *NO* to cancel.");
        }
    }

    private static async finalizeOnboarding(phoneNumber: string, session: OnboardingSession) {
        try {
            // 1. Create Tenant
            const tenant = await TenantService.createTenant({
                name: session.businessName,
                subdomain: session.subdomain,
                branding_config: {
                    primaryColor: '#0F766E', // Sovereign Teal default
                    accentColor: '#F59E0B',  // Amber/Gold accent
                    fontFamily: 'Inter',
                    borderRadius: '12px',
                    hero: {
                        title: `Welcome to ${session.businessName}`,
                        subtitle: 'Shop our professional collection online.',
                        ctaText: 'View Products'
                    }
                }
            });

            if (!tenant) throw new Error('Tenant creation failed');

            // 2. Bind Phone Number
            // We'll need a way to bind this phone immediately without OTP since it's an "in-band" signup
            await WhatsAppAuthService.verifyAndBindManual(phoneNumber, tenant.id);

            // 3. Create Sample Product
            await ProductService.createProduct({
                tenant_id: tenant.id,
                name: "Welcome to SOLO",
                description: "This is your first product! You can edit or delete it anytime from your dashboard.",
                price: 1000,
                stock_quantity: 1,
                image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
                is_active: true,
                is_featured: true
            });

            // 4. Clear Session
            await redis.del(`whatsapp:onboarding:${phoneNumber}`);

            const message = `Congratulations! 🎊 Your store is LIVE at:\n\n🔗 *https://${session.subdomain}.solo.ng*\n\nYou can now manage your store right here! Try typing *MENU* to see what I can do.`;
            return WhatsAppService.sendText(phoneNumber, message);

        } catch (err) {
            logger.error('WhatsApp Onboarding failed at final step', err);
            return WhatsAppService.sendText(phoneNumber, "I'm sorry, I encountered a technical glitch while setting up your store. Please try again in a few minutes or use our website.");
        }
    }
}
