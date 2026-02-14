/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        company1: '#FF6B6B',
        company2: '#4ECDC4',
        company3: '#45B7D1',
        company4: '#FFA07A',
        company5: '#98D8C8',
        company6: '#C7CEEA',
      }
    },
  },
  plugins: [],
}
