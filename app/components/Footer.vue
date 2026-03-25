<template>
  <footer class="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 text-center border-t flex justify-center gap-4">
    <NuxtLink
      to="https://github.com/arashsheyda/badger"
      external
      class="flex items-center gap-2 text-gray-700 hover:text-gray-900"
    >
      <Icon name="i-carbon-logo-github" />
      View source
    </NuxtLink>
    <span class="text-gray-400">|</span>
    <NuxtLink
      to="https://viper-ide.org/"
      external
      class="text-gray-700 hover:text-gray-900"
    >
      Edit code on viper
    </NuxtLink>
  </footer>
</template>
