import QRCode from 'qrcode';
import { getBaseUrl } from '@/lib/baseUrl';
import { URLService } from '@/lib/url';

export class QRService {
    /**
     * Generates a data URL for a QR code.
     *
     * Uses solid dark-on-white for reliable scanning. A tinted foreground on a
     * transparent background (the previous brand-purple choice) leaves the
     * "light" modules taking on whatever surface the code is printed against,
     * which routinely drops contrast below what phone cameras can decode.
     */
    static async generateQR(data: string): Promise<string> {
        try {
            return await QRCode.toDataURL(data, {
                width: 400,
                margin: 2,
                errorCorrectionLevel: 'H',
                color: {
                    dark: '#0F172A', // near-black for high contrast
                    light: '#FFFFFF' // solid white background
                }
            });
        } catch (err) {
            console.error('[QRService] QR generation failed:', err);
            return '';
        }
    }

    /**
     * Generates a QR code for a digital receipt.
     */
    static async getReceiptQR(receiptId: string): Promise<string> {
        const url = `${getBaseUrl()}/receipt/${receiptId}`;
        return this.generateQR(url);
    }


    /**
     * Generates a QR code for a product (e.g. for store shelf labeling).
     */
    static async getProductQR(productId: string, tenantSubdomain: string): Promise<string> {
        const url = URLService.getStoreUrl(tenantSubdomain, `/product/${productId}`);
        return this.generateQR(url);
    }
}
