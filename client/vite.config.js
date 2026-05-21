import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    // Bind to all interfaces so the Docker dev container is reachable from host
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_SOCKET_URL || 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  preview: {
    port: 4173,
    host: '0.0.0.0',
  },

  build: {
    // Produce source maps for error tracking (optional — remove for smaller builds)
    sourcemap: false,
    rollupOptions: {
      output: {
        // Code-split large vendor chunks (rolldown requires a function)
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'chart-vendor';
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'map-vendor';
          if (id.includes('node_modules/socket.io-client')) return 'socket-vendor';
          if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux')) return 'redux-vendor';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'react-vendor';
        },
      },
    },
  },
})
