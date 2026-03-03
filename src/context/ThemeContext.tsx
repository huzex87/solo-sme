'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    // Load saved theme on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            const saved = localStorage.getItem('solo-theme') as Theme | null;
            if (saved === 'light' || saved === 'dark') {
                if (theme !== saved) setTheme(saved);
                document.documentElement.setAttribute('data-theme', saved);
            } else {
                // Detect system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const detected = prefersDark ? 'dark' : 'light';
                if (theme !== detected) setTheme(detected);
                document.documentElement.setAttribute('data-theme', detected);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [theme]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('solo-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
