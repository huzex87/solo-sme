'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface SlideToConfirmProps {
    onConfirm: () => void;
    label?: string;
    successLabel?: string;
    disabled?: boolean;
}

export default function SlideToConfirm({ onConfirm, label = 'Slide to confirm', successLabel = 'Confirmed', disabled = false }: SlideToConfirmProps) {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [sliderPos, setSliderPos] = useState(0);
    const isDragging = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleStart = (clientX: number) => {
        if (isConfirmed || disabled) return;
        isDragging.current = true;
    };

    const handleMove = useCallback((clientX: number) => {
        if (!isDragging.current || !containerRef.current || isConfirmed) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width - 60; // Button width + padding
        let pos = clientX - rect.left - 30;
        if (pos < 0) pos = 0;
        if (pos > width) pos = width;
        setSliderPos(pos);

        if (pos >= width * 0.95) {
            handleConfirm();
        }
    }, [isConfirmed]);

    const handleEnd = useCallback(() => {
        if (isConfirmed) return;
        isDragging.current = false;
        if (sliderPos < (containerRef.current?.getBoundingClientRect().width || 0) * 0.8) {
            setSliderPos(0);
        }
    }, [isConfirmed, sliderPos]);

    const handleConfirm = () => {
        setIsConfirmed(true);
        setSliderPos(containerRef.current?.getBoundingClientRect().width ? containerRef.current.getBoundingClientRect().width - 60 : 250);
        setTimeout(() => {
            onConfirm();
        }, 600);
    };

    // Touch & Mouse Events
    useEffect(() => {
        const handleUp = () => handleEnd();
        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchend', handleUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [handleMove, handleEnd]);

    return (
        <div
            ref={containerRef}
            className={`slide-container ${disabled ? 'disabled' : ''}`}
            onMouseDown={(e) => handleStart(e.clientX)}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        >
            <div className="slide-bg">
                <span className={`slide-text ${sliderPos > 50 ? 'fade' : ''}`}>{isConfirmed ? successLabel : label}</span>
            </div>
            <div
                className={`slide-button ${isConfirmed ? 'confirmed' : ''}`}
                style={{ transform: `translateX(${sliderPos}px)` }}
            >
                <ChevronRight size={24} />
            </div>

            <style jsx>{`
        .slide-container {
          position: relative;
          height: 60px;
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 30px;
          padding: 5px;
          user-select: none;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }
        .slide-bg {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .slide-text {
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: opacity 0.3s;
        }
        .slide-text.fade { opacity: 0; }
        .slide-button {
          position: absolute;
          top: 5px;
          left: 5px;
          width: 50px;
          height: 50px;
          background: var(--accent-primary);
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bg-primary);
          box-shadow: 0 4px 12px rgba(0, 229, 255, 0.3);
          transition: transform 0.1s ease-out, background 0.3s;
        }
        .slide-button.confirmed {
          background: var(--color-success);
          box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
        </div>
    );
}
