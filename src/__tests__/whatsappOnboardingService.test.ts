import { WhatsAppOnboardingService } from '@/services/whatsappOnboardingService';
import redis from '@/lib/redis';
import { WhatsAppService } from '@/services/whatsappService';
import { TenantService } from '@/services/tenantService';
import { WhatsAppAuthService } from '@/services/whatsappAuthService';
import { ProductService } from '@/services/productService';

jest.mock('@/lib/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
}));

jest.mock('@/services/whatsappService', () => ({
    WhatsAppService: {
        sendText: jest.fn(),
    },
}));

jest.mock('@/services/tenantService', () => ({
    TenantService: {
        getTenantBySubdomain: jest.fn(),
        createTenant: jest.fn(),
    },
}));

jest.mock('@/services/whatsappAuthService', () => ({
    WhatsAppAuthService: {
        verifyAndBindManual: jest.fn(),
    },
}));

jest.mock('@/services/productService', () => ({
    ProductService: {
        createProduct: jest.fn(),
    },
}));

describe('WhatsAppOnboardingService', () => {
    const phoneNumber = '2348000000000';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('starts onboarding on first message (IDLE state)', async () => {
        (redis.get as jest.Mock).mockResolvedValue(null);

        await WhatsAppOnboardingService.handleMessage(phoneNumber, 'Hello');

        expect(redis.set).toHaveBeenCalledWith(
            `whatsapp:onboarding:${phoneNumber}`,
            expect.objectContaining({ state: 'AWAITING_NAME' }),
            { ex: 3600 }
        );
        expect(WhatsAppService.sendText).toHaveBeenCalledWith(
            phoneNumber,
            expect.stringContaining('what is your *Business Name*?')
        );
    });

    it('handles business name input and transitions to AWAITING_INDUSTRY', async () => {
        (redis.get as jest.Mock).mockResolvedValue({ state: 'AWAITING_NAME', lastUpdated: Date.now() });

        await WhatsAppOnboardingService.handleMessage(phoneNumber, 'Tech Solutions');

        expect(redis.set).toHaveBeenCalledWith(
            `whatsapp:onboarding:${phoneNumber}`,
            expect.objectContaining({ state: 'AWAITING_INDUSTRY', businessName: 'Tech Solutions' }),
            { ex: 3600 }
        );
    });

    it('handles industry input and transitions to AWAITING_SUBDOMAIN with suggestion', async () => {
        (redis.get as jest.Mock).mockResolvedValue({
            state: 'AWAITING_INDUSTRY',
            businessName: 'Tech Solutions',
            lastUpdated: Date.now()
        });

        await WhatsAppOnboardingService.handleMessage(phoneNumber, 'Software');

        expect(redis.set).toHaveBeenCalledWith(
            `whatsapp:onboarding:${phoneNumber}`,
            expect.objectContaining({ state: 'AWAITING_SUBDOMAIN', industry: 'Software' }),
            { ex: 3600 }
        );
        expect(WhatsAppService.sendText).toHaveBeenCalledWith(
            phoneNumber,
            expect.stringContaining('tech-solutions') // Suggestion based on business name
        );
    });

    it('handles subdomain input and transitions to AWAITING_CONFIRMATION if available', async () => {
        (redis.get as jest.Mock).mockResolvedValue({
            state: 'AWAITING_SUBDOMAIN',
            businessName: 'Tech Solutions',
            industry: 'Software',
            lastUpdated: Date.now()
        });
        (TenantService.getTenantBySubdomain as jest.Mock).mockResolvedValue(null);

        await WhatsAppOnboardingService.handleMessage(phoneNumber, 'techsolutions');

        expect(redis.set).toHaveBeenCalledWith(
            `whatsapp:onboarding:${phoneNumber}`,
            expect.objectContaining({ state: 'AWAITING_CONFIRMATION', subdomain: 'techsolutions' }),
            { ex: 3600 }
        );
    });

    it('finalizes onboarding when merchant says YES', async () => {
        const session = {
            state: 'AWAITING_CONFIRMATION',
            businessName: 'Tech Solutions',
            industry: 'Software',
            subdomain: 'techsolutions',
            lastUpdated: Date.now()
        };
        (redis.get as jest.Mock).mockResolvedValue(session);
        (TenantService.createTenant as jest.Mock).mockResolvedValue({ id: 'tenant-123' });

        await WhatsAppOnboardingService.handleMessage(phoneNumber, 'YES');

        expect(TenantService.createTenant).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Tech Solutions', subdomain: 'techsolutions' })
        );
        expect(WhatsAppAuthService.verifyAndBindManual).toHaveBeenCalledWith(phoneNumber, 'tenant-123');
        expect(ProductService.createProduct).toHaveBeenCalled();
        expect(redis.del).toHaveBeenCalledWith(`whatsapp:onboarding:${phoneNumber}`);
    });
});
