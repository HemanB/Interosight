/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f8f5',
          100: '#eef1e8',
          200: '#dde3d1',
          300: '#c4d0b0',
          400: '#a3b885',
          500: '#8fbc8f', // Dark Sea Green - Main accent
          600: '#6b8e23', // Olive Drab
          700: '#556b2f', // Olive Green
          800: '#4a5a28',
          900: '#3d4a22',
        },
        olive: {
          50: '#f7f8f5',
          100: '#eef1e8',
          200: '#dde3d1',
          300: '#c4d0b0',
          400: '#a3b885',
          500: '#556b2f', // Olive Green
          600: '#6b8e23', // Olive Drab
          700: '#8fbc8f', // Dark Sea Green
          800: '#bdb76b', // Dark Khaki
          900: '#8b4513', // Saddle Brown
        },
        accent: {
          50: '#fdfbf7',
          100: '#faf6ed',
          200: '#f4ecd4',
          300: '#ecddb0',
          400: '#e2c980',
          500: '#bdb76b', // Dark Khaki
          600: '#a8a25a',
          700: '#8b8a4a',
          800: '#6f6e3d',
          900: '#5a5932',
        },
        brown: {
          50: '#fdf8f3',
          100: '#faf0e6',
          200: '#f4e0c8',
          300: '#ecc99a',
          400: '#e2ad6b',
          500: '#8b4513', // Saddle Brown
          600: '#7a3d11',
          700: '#69350f',
          800: '#582d0d',
          900: '#47250b',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
    },
  },
  plugins: [],
} 