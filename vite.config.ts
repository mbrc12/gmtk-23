import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    server: {
        port: 1420,
        strictPort: true,
    },

    build: {
        assetsInlineLimit: 0,

        chunkSizeWarningLimit: 2048,

        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    }}));
