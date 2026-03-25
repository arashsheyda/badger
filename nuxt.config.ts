import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({

  compatibilityDate: '2025-07-15',

  css: [
    '~/assets/css/main.css',
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/test-utils',
  ],

  devtools: {
    enabled: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@vueuse/core',
      ],
    },
  },
})
