/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Newsreader', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
      },
      fontSize: {
        caption: ['12px', { lineHeight: '16px' }],
        footnote: ['13px', { lineHeight: '18px' }],
        subheadline: ['15px', { lineHeight: '20px' }],
        body: ['16px', { lineHeight: '24px' }],
        headline: ['17px', { lineHeight: '22px', fontWeight: '600' }],
        title3: ['20px', { lineHeight: '26px' }],
        title2: ['22px', { lineHeight: '28px' }],
        title1: ['28px', { lineHeight: '34px' }],
        largeTitle: ['34px', { lineHeight: '41px' }],
        display: ['64px', { lineHeight: '1.05' }],
      },
      colors: {
        bg: 'oklch(var(--bg) / <alpha-value>)',
        'bg-elevated': 'oklch(var(--bg-elevated) / <alpha-value>)',
        glass: 'oklch(var(--glass) / <alpha-value>)',
        'glass-strong': 'oklch(var(--glass-strong) / <alpha-value>)',
        fg: 'oklch(var(--fg) / <alpha-value>)',
        'fg-muted': 'oklch(var(--fg-muted) / <alpha-value>)',
        'fg-subtle': 'oklch(var(--fg-subtle) / <alpha-value>)',
        border: 'oklch(var(--border) / <alpha-value>)',
        'border-strong': 'oklch(var(--border-strong) / <alpha-value>)',
        accent: 'oklch(var(--accent) / <alpha-value>)',
        'accent-fg': 'oklch(var(--accent-fg) / <alpha-value>)',
        'status-open': 'oklch(var(--status-open) / <alpha-value>)',
        'status-pending': 'oklch(var(--status-pending) / <alpha-value>)',
        'status-resolved': 'oklch(var(--status-resolved) / <alpha-value>)',
        'status-closed': 'oklch(var(--status-closed) / <alpha-value>)',
        'status-breach': 'oklch(var(--status-breach) / <alpha-value>)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 1px 0 0 oklch(1 0 0 / 0.08) inset, 0 8px 32px -8px oklch(0 0 0 / 0.18)',
        'glass-lg': '0 1px 0 0 oklch(1 0 0 / 0.10) inset, 0 24px 64px -16px oklch(0 0 0 / 0.32)',
      },
      keyframes: {
        'mesh-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(2%, -3%, 0) scale(1.05)' },
          '66%': { transform: 'translate3d(-2%, 2%, 0) scale(0.95)' },
        },
        'mesh-drift-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-3%, 4%, 0) scale(1.08)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'mesh-drift': 'mesh-drift 28s ease-in-out infinite',
        'mesh-drift-slow': 'mesh-drift-slow 36s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
