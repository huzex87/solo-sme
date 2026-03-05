'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Unhandled Dashboard Error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="dashboard-error">
                    <div className="error-icon">
                        <AlertTriangle size={40} />
                    </div>

                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        Sovereign Guard Triggered
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '2.5rem', fontSize: '1.125rem' }}>
                        We detected an instability in the current module. Our defensive rendering has engaged to protect your account data.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-primary"
                            style={{ padding: '1rem 2rem' }}
                        >
                            <RefreshCw size={20} className="mr-2" />
                            Restart Module
                        </button>
                        <a
                            href="/dashboard"
                            className="btn btn-secondary"
                            style={{ padding: '1rem 2rem' }}
                        >
                            <Home size={20} className="mr-2" />
                            Return to Dashboard
                        </a>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div style={{
                            marginTop: '3rem',
                            padding: '1.5rem',
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '8px',
                            textAlign: 'left',
                            maxWidth: '800px',
                            width: '100%',
                            overflow: 'auto',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            color: '#666'
                        }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#ef4444' }}>Diagnostic Info:</p>
                            {this.state.error?.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
