import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// P93: the phone app's interface, built into public/spa; routes/web.php returns its index.html for every path that is not /api.
// Everything is bundled (fonts, icons, Vue): the app opens without a network (P57). Fixed asset names keep the update check simple.
// From the first phone app's resources/spa/vite.config.js, with single-file components instead of string templates.
export default defineConfig({
  base: '/spa/',
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    outDir: fileURLToPath(new URL('../../public/spa', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: { output: { entryFileNames: 'assets/app.js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]' } },
  },
})
