<script setup lang="ts">
const emit = defineEmits<{
  copy: []
}>()
</script>

<template>
  <div class="w-full max-w-lg mx-auto">
    <div class="relative bg-linear-to-b from-[#1f1f1f] to-[#131313] shadow-2xl rounded-2xl p-4 aspect-31/28 overflow-hidden">
      <div class="absolute top-4 left-8 w-16 h-2.5 bg-white/90 rounded-lg" />
      <div class="absolute top-4 right-8 w-16 h-2.5 bg-white/90 rounded-lg" />

      <div class="absolute bottom-2 left-2 w-2 h-2 bg-white/60 rounded-full" />
      <div class="absolute bottom-2 right-2 w-2 h-2 bg-white/60 rounded-full" />

      <div class="absolute top-[10%] left-1/2 transform -translate-x-1/2">
        <Icon
          class="text-white z-10 relative"
          style="width: 7rem; height: 7rem;"
          name="i-carbon-logo-github"
        />
      </div>

      <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 w-[90%]">
        <div
          id="canvas"
          class="border-2 border-white/20 overflow-hidden rounded-sm flex-1"
          style="height: 192px;"
        />
        <div class="text-white/60 flex flex-col justify-around">
          <Icon name="i-carbon-chevron-up" />
          <Icon name="i-carbon-chevron-down" />
        </div>
      </div>

      <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <button
          class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-emerald-400 transition-colors duration-200 px-3 py-1 rounded-full hover:bg-white/5"
          @click="emit('copy')"
        >
          <Icon name="i-carbon-download" class="w-3.5 h-3.5" />
          Copy to Badge
        </button>
      </div>
    </div>
  </div>
</template>
