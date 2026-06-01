/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        // "Just changed" cue (a freed slot reappearing, or a new appointment
        // landing): a clear teal wash + inset teal ring that holds briefly then
        // eases out. Uses an *inset* box-shadow + background so it stays visible
        // even inside an overflow-hidden container (an outset ring would clip).
        'flash-highlight': {
          '0%, 30%': {
            boxShadow: 'inset 0 0 0 2px hsl(var(--primary) / 0.6)',
            backgroundColor: 'hsl(var(--accent-teal))',
          },
          '100%': {
            boxShadow: 'inset 0 0 0 2px hsl(var(--primary) / 0)',
            backgroundColor: 'transparent',
          },
        },
      },
      animation: {
        'flash-highlight': 'flash-highlight 3s ease-out',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'surface-muted': 'hsl(var(--surface-muted))',
        'accent-teal': {
          DEFAULT: 'hsl(var(--accent-teal))',
          foreground: 'hsl(var(--accent-teal-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        confirmed: 'hsl(var(--status-confirmed))',
        completed: 'hsl(var(--status-completed))',
        cancelled: 'hsl(var(--status-cancelled))',
        pending: 'hsl(var(--status-pending))',
      },
    },
  },
  plugins: [],
};
