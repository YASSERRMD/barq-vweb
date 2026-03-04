import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
    plugins: [wasm(), topLevelAwait()],
    server: {
        port: 5174,
        fs: {
            // Allow Vite to serve files from wasm/pkg (outside examples/ root)
            allow: ['..']
        }
    },
    optimizeDeps: {
        exclude: ['barq-vweb']
    },
    build: {
        target: 'esnext',
        outDir: 'dist'
    }
});
