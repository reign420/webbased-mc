import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
      host: 'webbasedmc-xdzr--5173--fb22cd3d.local-corp.webcontainer.io'
    }
  }
})