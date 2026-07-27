/**
 * Phone normalisation shared across the WhatsApp layer.
 *
 * Lives here rather than in intentEngine so that services which only need to
 * normalise a number (e.g. whatsappService) don't pull in the Gemini client.
 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) return '234' + digits.slice(1);
  if (digits.length < 10 || digits.length > 15) return '';
  return digits;
}
