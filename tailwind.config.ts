import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#080B1A',
        surface:  '#0D1229',
        surface2: '#111827',
        border:   'rgba(255,255,255,0.08)',
        primary: {
          DEFAULT: '#2563EB',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        accent:  '#06B6D4',
        purple:  '#7C3AED',
        // Keep legacy compat aliases
        secondary: {
          DEFAULT: '#F1F5F9',
          200: '#94A3B8',
        },
        ivory:   '#FAF8F5',
        mist:    '#F1F5F9',
        muted:   '#64748B',
        cloud:   '#FFFFFF',
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#EF4444',
        slate: {
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#1e3a8a',
        },
        violet: {
          400: '#A78BFA',
          600: '#7C3AED',
          900: '#4C1D95',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
        'grad-blue':  'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
        'grad-hero':  'linear-gradient(135deg, #080B1A 0%, #0D1229 100%)',
      },
      boxShadow: {
        'glass':   '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.08)',
        'widget':  '0 32px 64px rgba(0,0,0,0.3), 0 8px 24px rgba(37,99,235,0.15)',
        'glow-blue': '0 0 24px rgba(37,99,235,0.4)',
        'glow-cyan': '0 0 24px rgba(6,182,212,0.4)',
        'card':    '0 4px 24px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        md: '14px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        pill: '999px',
      },
      animation: {
        'ticker':    'ticker 30s linear infinite',
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.35s ease-out',
        'pulse-slow':'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
