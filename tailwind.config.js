/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#141414',
        card: '#1e1e1e',
        elevated: '#262626',
        secondary: '#1a1a1a',
        border: '#2a2a2a',
        divider: '#242424',
        textPrimary: '#ececec',
        textSecondary: '#8a8a8a',
        textMuted: '#555555',
        accent: '#7c9fff',
        success: '#3dba7e',
        danger: '#e05252',
        warning: '#d4870a',
        legalBg: '#0d2b1e',
        reviewBg: '#2b1f08',
        missingBg: '#2b1010',
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
