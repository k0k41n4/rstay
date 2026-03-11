// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // INI KUNCINYA: Bikin web lu bisa static sekaligus punya backend
  output: 'static', 

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [svelte()]
});