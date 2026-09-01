import { WhatsAppUtils } from '@/lib/whatsapp';

/**
 * Regression tests for wa.me link generation.
 *
 * A wa.me link with a missing or local-format number makes WhatsApp open the
 * contact picker instead of the chat. These lock the normalization that turns a
 * Nigerian local number into full international format.
 */
describe('WhatsAppUtils.normalizeWhatsAppNumber', () => {
    it('converts a Nigerian local number (leading 0) to international', () => {
        expect(WhatsAppUtils.normalizeWhatsAppNumber('09121704067')).toBe('2349121704067');
    });

    it('handles a formatted local number with spaces/dashes', () => {
        expect(WhatsAppUtils.normalizeWhatsAppNumber('0912-170 4067')).toBe('2349121704067');
    });

    it('prefixes a bare 10-digit national number', () => {
        expect(WhatsAppUtils.normalizeWhatsAppNumber('9121704067')).toBe('2349121704067');
    });

    it('keeps an already-international number', () => {
        expect(WhatsAppUtils.normalizeWhatsAppNumber('2349121704067')).toBe('2349121704067');
    });

    it('strips a + and 00 international prefix', () => {
        expect(WhatsAppUtils.normalizeWhatsAppNumber('+2349121704067')).toBe('2349121704067');
        expect(WhatsAppUtils.normalizeWhatsAppNumber('002349121704067')).toBe('2349121704067');
    });

    it('returns empty string for missing/blank input (so callers can hide the link)', () => {
        expect(WhatsAppUtils.normalizeWhatsAppNumber('')).toBe('');
        expect(WhatsAppUtils.normalizeWhatsAppNumber(undefined)).toBe('');
        expect(WhatsAppUtils.normalizeWhatsAppNumber(null)).toBe('');
        expect(WhatsAppUtils.normalizeWhatsAppNumber('---')).toBe('');
    });
});

describe('WhatsAppUtils.buildChatLink', () => {
    it('builds a valid wa.me link with an encoded message', () => {
        expect(WhatsAppUtils.buildChatLink('09121704067', 'Hi there')).toBe(
            'https://wa.me/2349121704067?text=Hi%20there'
        );
    });

    it('builds a bare wa.me link when no text is given', () => {
        expect(WhatsAppUtils.buildChatLink('2349121704067')).toBe('https://wa.me/2349121704067');
    });

    it('returns null (not a picker-opening link) when the number is unusable', () => {
        expect(WhatsAppUtils.buildChatLink('')).toBeNull();
        expect(WhatsAppUtils.buildChatLink(undefined)).toBeNull();
    });
});
