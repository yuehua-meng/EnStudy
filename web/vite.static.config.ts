import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  base: './',
  root: fileURLToPath(new URL('./deploy', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  plugins: [react()],
  resolve: {alias: {'@': root}, dedupe: ['react', 'react-dom']},
  css: {postcss: root},
  build: {outDir: fileURLToPath(new URL('./dist-static', import.meta.url)), emptyOutDir: true},
  server: {host: '127.0.0.1', port: 5174, strictPort: true, proxy:{'/api':{target:'http://127.0.0.1:8090'}}},
  preview: {host: '127.0.0.1', port: 5174, strictPort: true, proxy:{'/api':{target:'http://127.0.0.1:8090'}}},
});
