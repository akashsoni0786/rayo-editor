import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [react(), dts({ include: ['src'] })],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'RayoEditor',
      formats: ['es', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'index.mjs';
        if (format === 'umd') return 'index.umd.js';
        return `index.${format}`;
      }
    },
    rollupOptions: {
      external: (id) => {
        // Only externalize true peer dependencies
        return id === 'react' || id === 'react-dom' || id === 'react/jsx-runtime';
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tiptap/react': 'Tiptap'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    dedupe: ['react', 'react-dom']
  }
})
