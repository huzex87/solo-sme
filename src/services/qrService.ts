import QRCode from 'qrcode';

export class QRService {
    /**
     * Generates a data URL for a QR code.
     */
    static async generateQR(data: string): Promise<string> {
        try {
            return await QRCode.toDataURL(data, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#ae4aff', // SOLO brand color
                    light: '#00000000' // transparent
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
        const url = `${window.location.origin}/receipt/${receiptId}`;
        return this.generateQR(url);
    }

    /**
     * Generates a QR code for a product (e.g. for store shelf labeling).
     */
    static async getProductQR(productId: string, tenantSubdomain: string): Promise<string> {
        const url = `https://${tenantSubdomain}.solo-sme.com/product/${productId}`;
        return this.generateQR(url);
    }
}
