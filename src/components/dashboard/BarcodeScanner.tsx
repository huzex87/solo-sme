'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import { logger } from '@/lib/logger';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "barcode-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                // Success
                onScan(decodedText);
            },
            (err) => {
                // Ignore frequent scan failures (common during search)
                if (typeof err === 'string' && !err.includes('NotFoundException')) {
                    logger.warn('Barcode scan failure', { error: err });
                }
            }
        );

        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => {
                    logger.error('Scanner cleanup failed', err);
                });
            }
        };
    }, [onScan]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: '#121212',
                borderRadius: '2rem',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Camera size={20} color="var(--accent-primary)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Scan Product Barcode</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '1rem' }}>
                    <div id="barcode-reader" style={{ width: '100%', borderRadius: '1rem', overflow: 'hidden' }}></div>



                    <div style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.875rem'
                    }}>
                        <p>Position the barcode within the frame to scan.</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>Works with EAN, UPC, and QR Codes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
