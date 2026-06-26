import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        brand: '#2563eb',
        cyanSoft: '#e0f2fe'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.10)'
      }
    }
  },
  plugins: []
};
export default config;
