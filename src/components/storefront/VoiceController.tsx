import { useState, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

// Speech Recognition Types
interface SpeechRecognitionResult {
    0: { transcript: string; };
}
interface SpeechRecognitionEvent {
    results: { [key: number]: SpeechRecognitionResult; length: number; };
}
interface SpeechRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: () => void;
    onend: () => void;
    stop: () => void;
    start: () => void;
}
interface SpeechRecognitionConstructor {
    new(): SpeechRecognitionInstance;
}
interface VoiceWindow extends Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface VoiceControllerProps {
    onTranscript: (text: string) => void;
    onStatusChange?: (isListening: boolean) => void;
}

export default function VoiceController({ onTranscript, onStatusChange }: VoiceControllerProps) {
    const [isListening, setIsListening] = useState(false);
    const [browserSupported, setBrowserSupported] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setBrowserSupported(false);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (!browserSupported) return;

        const windowObj = window as unknown as VoiceWindow;
        const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            onStatusChange?.(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
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
            className={`voice-trigger ${isListening ? 'active' : ''}`}
            title={isListening ? "Stop Listening" : "Start Voice Assistant"}
        >
            {isListening ? (
                <Square size={16} fill="currentColor" strokeWidth={0} />
            ) : (
                <Mic size={18} />
            )}

            {isListening && <div className="voice-rings">
                <div className="ring" />
                <div className="ring" />
            </div>}

            <style jsx>{`
                .voice-trigger {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .voice-trigger:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--accent-primary);
                    color: var(--text-primary);
                }

                .voice-trigger.active {
                    background: var(--accent-primary);
                    color: #000;
                    border-color: transparent;
                }

                .voice-rings {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .ring {
                    position: absolute;
                    inset: -4px;
                    border: 1px solid var(--accent-primary);
                    border-radius: 14px;
                    opacity: 0;
                    animation: expand 2s infinite;
                }

                .ring:nth-child(2) {
                    animation-delay: 1s;
                }

                @keyframes expand {
                    0% { transform: scale(0.9); opacity: 0.8; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>
        </button>
    );
}
