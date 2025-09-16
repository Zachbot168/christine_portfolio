import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  assetsInclude: ['**/*.JPG', '**/*.jpg', '**/*.jpeg'],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "/src/styles/variables.scss" as *;`
      }
    }
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        work: 'work.html',
        contact: 'contact.html',
        vibes: 'vibes.html',
        journalism: 'journalism.html',
        marketing: 'marketing.html',
        texture: 'texture.html',
        serenity: 'serenity.html',
        spirit: 'spirit.html',
        adventure: 'adventure.html',
        commencement: 'commencement.html',
        film: 'film.html'
      },
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          barba: ['@barba/core', '@barba/css'],
          locomotive: ['locomotive-scroll']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'gsap', '@barba/core', 'locomotive-scroll']
  }
});