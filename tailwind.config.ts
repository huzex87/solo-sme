import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00798C',
          hover: '#006170',
          light: 'rgba(0, 121, 140, 0.08)',
          surface: 'rgba(0, 121, 140, 0.04)',
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: 'rgba(245, 158, 11, 0.04)',
        },
        // Refined Neutral Palette (Zinc-based for modern SaaS feel)
        surface: '#FFFFFF',
        background: '#FAFAFA',
        card: '#FFFFFF',
        body: '#3F3F46', // zinc-700
        heading: '#09090B', // zinc-950
        muted: '#71717A', // zinc-500
        subtle: '#A1A1AA', // zinc-400
        border: {
          DEFAULT: 'rgba(9, 9, 11, 0.06)',
          strong: 'rgba(9, 9, 11, 0.12)',
          light: 'rgba(9, 9, 11, 0.03)',
        },
        success: {
          DEFAULT: '#10B981',
          light: 'rgba(16, 185, 129, 0.06)',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: 'rgba(239, 68, 68, 0.06)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: 'rgba(245, 158, 11, 0.06)',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: 'rgba(59, 130, 246, 0.06)',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        // Multi-layered High-End SaaS Shadows (Stripe/Linear style)
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'premium': '0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02), 0 12px 24px rgba(0, 0, 0, 0.03)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'inset-white': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%)',
      },
    },
  },
  plugins: [],
}

export default config

