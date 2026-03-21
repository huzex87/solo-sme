'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { Download, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
    url: string;
    size?: number;
    logoUrl?: string;
    title?: string;
    subtitle?: string;
    showActions?: boolean;
    className?: string;
}

export function QRCodeDisplay({
    url,
    size = 200,
    logoUrl,
    title,
    subtitle,
    showActions = true,
    className,
}: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dataUrl, setDataUrl] = useState<string>('');
    const [isReady, setIsReady] = useState(false);

    const generateQR = useCallback(async () => {
        try {
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: size,
                margin: 2,
                color: {
                    dark: '#002D44',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: logoUrl ? 'H' : 'M',
            });

            if (logoUrl) {
                const finalUrl = await overlayLogo(qrDataUrl, logoUrl, size);
                setDataUrl(finalUrl);
            } else {
                setDataUrl(qrDataUrl);
            }
            setIsReady(true);
        } catch (err) {
            console.error('QR generation failed:', err);
        }
    }, [url, size, logoUrl]);

    useEffect(() => {
        generateQR();
    }, [generateQR]);

    const overlayLogo = (qrUrl: string, logo: string, qrSize: number): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = qrSize;
            canvas.height = qrSize;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(qrUrl);

            const qrImg = new Image();
            qrImg.crossOrigin = 'anonymous';
            qrImg.onload = () => {
                ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);

                const logoImg = new Image();
                logoImg.crossOrigin = 'anonymous';
                logoImg.onload = () => {
                    const logoSize = qrSize * 0.22;
                    const logoX = (qrSize - logoSize) / 2;
                    const logoY = (qrSize - logoSize) / 2;
                    const pad = 4;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.roundRect(
                        logoX - pad,
                        logoY - pad,
                        logoSize + pad * 2,
                        logoSize + pad * 2,
                        8
                    );
                    ctx.fill();

                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(logoX, logoY, logoSize, logoSize, 6);
                    ctx.clip();
                    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                    ctx.restore();

                    resolve(canvas.toDataURL('image/png'));
                };
                logoImg.onerror = () => resolve(qrUrl);
                logoImg.src = logo;
            };
            qrImg.src = qrUrl;
        });
    };

    const handleDownload = () => {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.download = `${title ? title.replace(/\s+/g, '-').toLowerCase() : 'qr-code'}.png`;
        link.href = dataUrl;
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title || 'QR Code'}</title>
                <style>
                    body {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: #fff;
                    }
                    img { max-width: 400px; }
                    h2 { margin: 24px 0 4px; font-size: 22px; color: #002D44; }
                    p { margin: 0; font-size: 14px; color: #6B7280; }
                </style>
            </head>
            <body>
                <img src="${dataUrl}" alt="QR Code" />
                ${title ? `<h2>${title}</h2>` : ''}
                ${subtitle ? `<p>${subtitle}</p>` : ''}
                <script>window.onload = () => { window.print(); window.close(); }<\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
                style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,45,68,0.06)',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
            >
                {isReady && dataUrl ? (
                    <img
                        src={dataUrl}
                        alt={title ? `QR code for ${title}` : 'QR code'}
                        width={size}
                        height={size}
                        style={{ display: 'block', borderRadius: '8px' }}
                    />
                ) : (
                    <div
                        style={{
                            width: size,
                            height: size,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f9fafb',
                            borderRadius: '8px',
                        }}
                    >
                        <div style={{
                            width: '28px',
                            height: '28px',
                            border: '3px solid #e5e7eb',
                            borderTopColor: '#00798C',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                    </div>
                )}
            </div>

            {title && (
                <div style={{ textAlign: 'center' }}>
                    <p style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--ink, #002D44)',
                        margin: 0,
                        lineHeight: 1.3,
                    }}>
                        {title}
                    </p>
                    {subtitle && (
                        <p style={{
                            fontSize: '13px',
                            color: 'var(--muted, #6B7280)',
                            margin: '4px 0 0',
                            fontWeight: 500,
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {showActions && (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleDownload}
                        className="btn btn-secondary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: 700,
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border, #e5e7eb)',
                            background: 'var(--surface, #fff)',
                            color: 'var(--ink, #002D44)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <Download size={15} />
                        Download
                    </button>
                    <button
                        onClick={handlePrint}
                        className="btn btn-secondary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: 700,
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: '1px solid var(--border, #e5e7eb)',
                            background: 'var(--surface, #fff)',
                            color: 'var(--ink, #002D44)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <Printer size={15} />
                        Print
                    </button>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}
