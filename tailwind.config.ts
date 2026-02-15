import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Gaming Gradient - Neon Blue to Purple spectrum
        'neon-blue': {
          DEFAULT: '#4DA3FF',
          light: '#60A5FA',
          dark: '#3B82F6',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#9333EA',
        },
        pink: {
          DEFAULT: '#EC4899',
          light: '#F472B6',
          dark: '#DB2777',
        },
        // Dark Navy backgrounds
        'black': {
          DEFAULT: '#050B1E',
          light: '#0A1026',
          lighter: '#0F172A',
        },
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(77, 163, 255, 0.3)',
        'gold-md': '0 0 24px rgba(139, 92, 246, 0.4)',
        'gold-lg': '0 0 40px rgba(139, 92, 246, 0.5)',
        'neon-blue': '0 0 20px rgba(77, 163, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;