/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'receipt-white': '#faf9f7',
        'receipt-gray': '#e5e5e3',
        'receipt-black': '#1a1a1a',
        'chipotle-red': '#8b2332',
        'sweetgreen-green': '#3d5a47',
        'cava-purple': '#4a3f6b',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
