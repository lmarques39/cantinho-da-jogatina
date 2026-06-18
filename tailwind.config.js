/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Sala de jogos ao fim da tarde": petróleo profundo + mostarda retro
        ink: {
          50: '#eef3f3',
          100: '#d7e2e3',
          200: '#aec5c7',
          300: '#80a4a7',
          400: '#4f7b7f',
          500: '#2e5a5e',
          600: '#1f4548',
          700: '#16363a',
          800: '#0f282b', // base background
          900: '#0a1d1f',
          950: '#061315',
        },
        cartridge: {
          // amarelo-mostarda "cartucho retro"
          50: '#fdf6e7',
          100: '#fbe9c0',
          200: '#f6d287',
          300: '#f0b94f',
          400: '#e7a02e', // accent principal
          500: '#cc8620',
          600: '#a66818',
          700: '#7d4d14',
          800: '#583612',
          900: '#3a230c',
        },
        signal: {
          // vermelho de etiqueta de preço/saldo
          400: '#e6533c',
          500: '#cc3f29',
          600: '#a8311f',
        },
        leaf: {
          // verde de "Em stock"
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
