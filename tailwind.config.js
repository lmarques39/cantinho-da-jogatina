/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // As cores ink-* são mapeadas para variáveis CSS que mudam entre
        // tema claro e escuro (definidas em globals.css). Isto permite que
        // TODOS os componentes existentes se adaptem automaticamente sem
        // precisar de classes `dark:` em cada um.
        ink: {
          50:  'rgb(var(--ink-50) / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          950: 'rgb(var(--ink-950) / <alpha-value>)',
        },
        cartridge: {
          50:  'rgb(var(--cartridge-50) / <alpha-value>)',
          100: 'rgb(var(--cartridge-100) / <alpha-value>)',
          200: 'rgb(var(--cartridge-200) / <alpha-value>)',
          300: 'rgb(var(--cartridge-300) / <alpha-value>)',
          400: 'rgb(var(--cartridge-400) / <alpha-value>)',
          500: 'rgb(var(--cartridge-500) / <alpha-value>)',
          600: 'rgb(var(--cartridge-600) / <alpha-value>)',
          700: 'rgb(var(--cartridge-700) / <alpha-value>)',
          800: 'rgb(var(--cartridge-800) / <alpha-value>)',
          900: 'rgb(var(--cartridge-900) / <alpha-value>)',
        },
        signal: {
          400: '#e6533c',
          500: '#cc3f29',
          600: '#a8311f',
        },
        leaf: {
          400: '#5fae6a',
          500: '#48954f',
          600: '#36773c',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        cart: '0.375rem',
      },
      boxShadow: {
        cart: '0 4px 0 0 rgba(0,0,0,0.25)',
        'cart-hover': '0 6px 0 0 rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        scanlines:
          'repeating-linear-gradient(to bottom, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)',
      },
    },
  },
  plugins: [],
};
