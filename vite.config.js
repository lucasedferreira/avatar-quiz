import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@import "./src/styles/_variables.scss";`
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        allowedHosts: ['.manchae.com', 'start-tec-senai.manchae.com']
    }
})
