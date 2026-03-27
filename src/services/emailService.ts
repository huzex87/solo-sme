import { getBaseUrl } from '@/lib/baseUrl';
import { formatCurrency } from '@/lib/utils';
import { BaseService } from './baseService';

/**
 * EmailService — sends transactional emails via Resend API.
 * 
 * Uses the internal /api/email route to keep the API key server-side.
 * Falls back silently in demo mode.
 */
export class EmailService extends BaseService {
  private static readonly API_PATH = '/api/email';

  /**
   * Send a generic email via the server route.
   */
  private static async send(payload: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<boolean> {
    try {
      const url = `${getBaseUrl()}${this.API_PATH}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        this.error('send', err as Error, payload);
        return false;
      }
      return true;
    } catch (err) {
      this.error('send', err as Error, payload);
      return false;
    }
  }

  /**
   * Welcome email after signup.
   */
  static async sendWelcome(to: string, businessName: string): Promise<boolean> {
    return this.send({
      to,
      subject: `Welcome to Solo SME, ${businessName}! 🚀`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:800;color:#0d1117;margin:0;">Solo SME</h1>
      <p style="color:#6b7280;font-size:13px;margin-top:4px;">Your AI-Powered Business Platform</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h2 style="font-size:20px;font-weight:700;color:#0d1117;margin:0 0 12px;">Welcome aboard, ${businessName}! 🎉</h2>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Your account is ready. Here's what you can do right now:
      </p>
      <ul style="color:#4b5563;font-size:14px;line-height:1.8;padding-left:20px;margin:0 0 24px;">
        <li><strong>Add products</strong> to your catalog</li>
        <li><strong>Connect WhatsApp</strong> for AI-powered customer support</li>
        <li><strong>Share your store link</strong> with customers</li>
        <li><strong>Process payments</strong> via Paystack</li>
      </ul>
      <a href="https://solosme.ng/dashboard" style="display:inline-block;padding:12px 24px;background:#f5a623;color:#fff;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;">
        Go to Dashboard →
      </a>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">
      © ${new Date().getFullYear()} Solo SME · Lagos, Nigeria
    </p>
  </div>
</body>
</html>`,
    });
  }

  /**
   * Order confirmation email.
   */
  static async sendOrderConfirmation(
    to: string,
    orderDetails: {
      orderId: string;
      customerName: string;
      items: { name: string; quantity: number; price: number }[];
      total: number;
      businessName: string;
    }
  ): Promise<boolean> {
    const itemRows = orderDetails.items
      .map(
        (item) =>
          `<tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${item.name}</td>
                        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:center;">${item.quantity}</td>
                        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:right;font-weight:600;">${formatCurrency(item.price)}</td>
                    </tr>`
      )
      .join('');

    return this.send({
      to,
      subject: `Order Confirmed #${orderDetails.orderId.slice(0, 8)} — ${orderDetails.businessName}`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:800;color:#0d1117;margin:0;">${orderDetails.businessName}</h1>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:48px;height:48px;border-radius:50%;background:#d1fae5;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:20px;">✓</span>
        </div>
        <h2 style="font-size:18px;font-weight:700;color:#0d1117;margin:0;">Order Confirmed!</h2>
        <p style="color:#6b7280;font-size:12px;margin-top:4px;">Order #${orderDetails.orderId.slice(0, 8)}</p>
      </div>
      <p style="color:#4b5563;font-size:14px;margin:0 0 20px;">Hi ${orderDetails.customerName},</p>
      <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Thank you for your order. Here's a summary:
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Item</th>
            <th style="text-align:center;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Qty</th>
            <th style="text-align:right;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:2px solid #0d1117;">
        <span style="font-size:14px;font-weight:800;color:#0d1117;">Total</span>
        <span style="font-size:18px;font-weight:800;color:#0d1117;">${formatCurrency(orderDetails.total)}</span>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:24px;">
      Powered by Solo SME
    </p>
  </div>
</body>
</html>`,
    });
  }

  /**
   * Broadcasts a template to multiple recipients sequentially.
   * Handles batching to avoid server timeouts.
   */
  static async sendBroadcast(
    recipients: string[],
    subject: string,
    html: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const to of recipients) {
      try {
        const success = await this.send({ to, subject, html });
        if (success) {
          sent++;
        } else {
          failed++;
        }
        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (err) {
        this.error('sendBroadcast', err as Error, { to, subject });
        failed++;
      }
    }

    return { sent, failed };
  }
}
