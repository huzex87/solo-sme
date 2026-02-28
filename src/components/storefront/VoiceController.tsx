'use client';

import { useState, useEffect, useCallback } from 'react';

interface VoiceControllerProps {
    onTranscript: (text: string) => void;
    onStatusChange?: (isListening: boolean) => void;
}

export default function VoiceController({ onTranscript, onStatusChange }: VoiceControllerProps) {
    const [isListening, setIsListening] = useState(false);
    const [browserSupported, setBrowserSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setBrowserSupported(false);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (!browserSupported) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            onStatusChange?.(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsListening(false);
            onStatusChange?.(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
            onStatusChange?.(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            onStatusChange?.(false);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }, [isListening, browserSupported, onTranscript, onStatusChange]);

    if (!browserSupported) return null;

    return (
        <button
            onClick={toggleListening}
            className={`btn btn-circle ${isListening ? 'btn-danger' : 'btn-ghost'}`}
            style={{
                width: '40px',
                height: '40px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'visible'
            }}
            title={isListening ? "Stop Listening" : "Start Voice Assistant"}
        >
            <span style={{ fontSize: '18px' }}>{isListening ? '🛑' : '🎙️'}</span>
            {isListening && (
                <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '10px',
                    height: '10px',
                    background: '#ff4d4f',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px #ff4d4f',
                    animation: 'pulse 1.5s infinite'
                }} />
            )}
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </button>
    );
}
