/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // CORE COLORS: A vibrant and modern palette
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa', // A nice, accessible violet
          500: '#8b5cf6', // Main primary color
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6', // A vibrant pink
          500: '#ec4899', // Main secondary color
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // DARK THEME: Essential for the glassmorphic look
        dark: {
          950: '#0c0a09', // Near black for deep backgrounds
          900: '#111827', // Main background color (slate-900)
          800: '#1f2937', // Lighter background (slate-800)
          700: '#374151', // Borders and dividers (slate-700)
        },
        // GLASS: Simplified for clarity and consistency
        glass: {
          10: 'rgba(255, 255, 255, 0.1)',
          20: 'rgba(255, 255, 255, 0.2)',
        },
      },
      
      // TYPOGRAPHY
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'Arial', 'sans-serif'],
      },

      // ANIMATIONS & KEYFRAMES: The heart of the liquid glassmorphic design
      animation: {
        'gradient-flow': 'gradient-flow 15s ease infinite',
        'liquid-blob': 'liquid-blob 20s infinite ease-in-out alternate',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        'gradient-flow': {
          '0%, 100%': { background-position: '0% 50%' },
          '50%': { background-position: '100% 50%' },
        },
        'liquid-blob': {
          '0%': { transform: 'scale(1) translate(0px, 0px) rotate(0deg)' },
          '25%': { transform: 'scale(1.2) translate(20px, -30px) rotate(90deg)' },
          '50%': { transform: 'scale(0.8) translate(-30px, 20px) rotate(180deg)' },
          '75%': { transform: 'scale(1.1) translate(-10px, 30px) rotate(270deg)' },
          '100%': { transform: 'scale(1) translate(0px, 0px) rotate(360deg)' },
        },
        'glow': {
          'from': { 'text-shadow': '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ec4899, 0 0 20px #ec4899' },
          'to': { 'text-shadow': '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ec4899, 0 0 40px #ec4899' },
        },
        'fade-in': {
          'from': { opacity: 0 },
          'to': { opacity: 1 },
        },
        'slide-up': {
          'from': { opacity: 0, transform: 'translateY(20px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
      },

      // GLASSMORPHISM HELPERS
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      borderRadius: {
        'glass': '24px',
        'glass-lg': '32px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.4)', // primary-500
        'glow-secondary': '0 0 20px rgba(236, 72, 153, 0.4)', // secondary-500
      },
    },
  },
  plugins: [
    // Custom plugin for text utilities and additional animations
    plugin(function({ addBase, addUtilities, theme }) {
      addBase({
        // Base styles for a dark theme
        'body': {
          backgroundColor: theme('colors.dark.900'),
          color: theme('colors.gray.200'),
          fontFamily: theme('fontFamily.sans'),
        },
      });
      
      // Responsive text size utilities
      addUtilities({
        '.text-hero': {
          fontSize: '2.5rem', // 40px
          lineHeight: '1.1',
          '@screen md': {
            fontSize: '4rem', // 64px
          },
        },
        '.text-title': {
          fontSize: '2rem', // 32px
          lineHeight: '1.2',
          '@screen md': {
            fontSize: '2.5rem', // 40px
          },
        },
        '.text-body': {
          fontSize: '1.125rem', // 18px
          lineHeight: '1.6',
          '@screen md': {
            fontSize: '1.25rem', // 20px
          },
        },
      });
    }),
  ],
}