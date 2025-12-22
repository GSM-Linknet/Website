import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@mui/icons-material/esm': path.resolve(__dirname, 'node_modules/@mui/icons-material'),
      '@mui/x-date-pickers/AdapterMoment/index.js': path.resolve(__dirname, 'node_modules/@mui/x-date-pickers/AdapterMoment/AdapterMoment.js'),
      '@mui/x-date-pickers/LocalizationProvider/index.js': path.resolve(__dirname, 'node_modules/@mui/x-date-pickers/LocalizationProvider/LocalizationProvider.js'),
      '@mui/x-date-pickers/DateTimePicker/index.js': path.resolve(__dirname, 'node_modules/@mui/x-date-pickers/DateTimePicker/DateTimePicker.js'),
    },
  },
})
