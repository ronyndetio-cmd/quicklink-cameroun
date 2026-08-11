/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Roboto"', 'system-ui', 'sans-serif'],
        sans: ['"Roboto"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EAF3F4',
          100: '#CFE4E7',
          200: '#A2C9CE',
          300: '#72ABB3',
          400: '#4A8F99',
          500: '#2E7480',
          600: '#235D68',
          700: '#1F7A8C',
          800: '#164450',
          900: '#123540',
          950: '#0B1B22',
        },
        // Kept the "gold" key so every existing gold-* utility class in the
        // app keeps working — only the hex values moved, from amber to the
        // single blue accent used everywhere instead (see senvato.com's use
        // of one consistent accent color for buttons, prices and badges).
        gold: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        forest: {
          50: '#EEF8F0',
          100: '#D5EEDA',
          200: '#ADDCB8',
          300: '#7FC793',
          400: '#48A565',
          500: '#2C8A4B',
          600: '#237038',
          700: '#1B542A',
          800: '#174629',
          900: '#0F2E1B',
        },
        // ink is CSS-variable-backed so the whole neutral ramp (backgrounds,
        // text, borders) flips automatically under the `dark` class without
        // touching every className that uses it.
        ink: {
          50: 'rgb(var(--ink-50) / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
        },
        surface: 'rgb(var(--surface) / <alpha-value>)',
      },
      boxShadow: {
        lift: '0 18px 40px -12px rgba(11, 27, 34, 0.28)',
      },
      keyframes: {
        'ql-rise': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ql-pop': {
          '0%': { transform: 'scale(0.85)', opacity: '0.4' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'ql-pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'ql-spin': {
          to: { transform: 'rotate(360deg)' },
        },
        'ql-shake': {
          '0%, 88%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '90%': { transform: 'translateX(-2px) rotate(-2deg)' },
          '92%': { transform: 'translateX(2px) rotate(2deg)' },
          '94%': { transform: 'translateX(-2px) rotate(-1.5deg)' },
          '96%': { transform: 'translateX(2px) rotate(1.5deg)' },
          '98%': { transform: 'translateX(-1px) rotate(0deg)' },
        },
      },
      animation: {
        rise: 'ql-rise 0.5s cubic-bezier(0.16,1,0.3,1) both',
        pop: 'ql-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        spin: 'ql-spin 0.9s linear infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar::-webkit-scrollbar': { display: 'none' },
        '.no-scrollbar': { '-ms-overflow-style': 'none', 'scrollbar-width': 'none' },
        '.grain': {
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
        },
        '.a-rise': { animation: 'ql-rise 0.5s cubic-bezier(0.16,1,0.3,1) both' },
        '.a-pop': { animation: 'ql-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' },
        '.a-spin': { animation: 'ql-spin 0.9s linear infinite' },
        '.a-shake': { animation: 'ql-shake 4.5s ease-in-out infinite' },
      });
      addUtilities({
        '@media (prefers-reduced-motion: reduce)': {
          '.a-rise, .a-pop, .a-spin, .a-shake': { animation: 'none !important' },
        },
      });
    },
  ],
};
