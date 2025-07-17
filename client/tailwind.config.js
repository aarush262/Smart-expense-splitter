module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: 'class', // 👈 enables dark theme via className
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        montraDark: '#121212',
        montraCard: 'rgba(255, 255, 255, 0.05)',
        montraText: '#ffffff',
        montraAccent: '#9f7aea', // purple
      },
    },
  },
  plugins: [],
};