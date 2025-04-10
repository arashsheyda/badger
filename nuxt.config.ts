export default defineNuxtConfig({

  compatibilityDate: '2024-11-01',

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/test-utils',
  ],

  devtools: {
    enabled: true,
  },

  future: {
    compatibilityVersion: 4,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
