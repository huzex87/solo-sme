/**
 * Phone normalisation shared across the WhatsApp layer.
 *
 * Lives here rather than in intentEngine so that services which only need to
 * normalise a number (e.g. whatsappService) don't pull in the Gemini client.
 */
export function normalisePhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  // Nigerian 11-digit local starting with 0: e.g. 08012345678 -> 2348012345678
  if (digits.startsWith('0') && digits.length === 11) {
    return '234' + digits.slice(1);
  }
  // Nigerian 10-digit local starting with 7, 8, 9: e.g. 8012345678 -> 2348012345678
  if (digits.length === 10 && /^[789]/.test(digits)) {
    return '234' + digits;
  }
  if (digits.length < 10 || digits.length > 15) return '';
  return digits;
}
