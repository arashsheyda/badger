<template>
  <footer class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200/60 py-3 px-4 text-center">
    <div class="flex items-center justify-center gap-3 text-sm">
      <NuxtLink
        to="https://github.com/arashsheyda/badger"
        external
        class="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors duration-200"
      >
        <Icon
          name="i-carbon-logo-github"
          class="w-4 h-4"
        />
        Source
      </NuxtLink>
      <span class="text-gray-300">·</span>
      <NuxtLink
        to="https://viper-ide.org/"
        external
        class="text-gray-500 hover:text-gray-900 transition-colors duration-200"
      >
        Edit on Viper
      </NuxtLink>
    </div>
  </footer>
</template>
