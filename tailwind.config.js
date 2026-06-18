/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Newsreader', 'Georgia', 'serif'],
      },
      colors: {
        aw: {
          bg: 'var(--aw-bg)',
          white: 'var(--aw-surface)',
          black: 'var(--aw-text)',
          muted: 'var(--aw-muted)',
          faint: 'var(--aw-faint)',
          line: 'var(--aw-line)',
          lineDark: 'var(--aw-line-dark)',
          accent: 'var(--aw-accent)',
          accentSoft: 'var(--aw-accent-soft)',
          warm: 'var(--aw-warm)',
          primary: 'var(--aw-primary-bg)',
          'primary-fg': 'var(--aw-primary-fg)',
        },
      },
      borderRadius: {
        card: '12px',
      },
      transitionTimingFunction: {
        aw: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
