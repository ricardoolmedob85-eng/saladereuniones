/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta ejecutiva: azul noche + grafito, con acentos por sala
        ink: {
          950: '#0B1220',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        room: {
          jobs: {
            DEFAULT: '#2563EB', // azul corporativo
            bg: '#EFF6FF',
            border: '#BFDBFE',
          },
          scott: {
            DEFAULT: '#059669', // esmeralda
            bg: '#ECFDF5',
            border: '#A7F3D0',
          },
          bezos: {
            DEFAULT: '#D97706', // ambar
            bg: '#FFFBEB',
            border: '#FDE68A',
          },
          gates: {
            DEFAULT: '#7C3AED', // violeta
            bg: '#F5F3FF',
            border: '#DDD6FE',
          },
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.06), 0 1px 3px 0 rgba(15, 23, 42, 0.08)',
        panel: '0 4px 24px -6px rgba(15, 23, 42, 0.15)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};
