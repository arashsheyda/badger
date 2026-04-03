<script setup lang="ts">
import type { BadgeStyle } from '~/types'

const emit = defineEmits<{
  copy: []
}>()

const badgeStyle = defineModel<BadgeStyle>('badgeStyle', {
  required: true,
})

const styles: BadgeStyle[] = ['default', 'contributions', 'skyline']
const styleLabels: Record<BadgeStyle, string> = {
  default: 'Classic',
  contributions: 'Contributions',
  skyline: 'Skyline',
}

function cycleStyle(direction: 1 | -1) {
  const idx = styles.indexOf(badgeStyle.value)
  const next = (idx + direction + styles.length) % styles.length
  badgeStyle.value = styles[next]!
}
</script>

<template>
  <div class="w-full max-w-lg mx-auto">
    <div class="relative bg-linear-to-b from-[#1f1f1f] to-[#131313] shadow-2xl rounded-2xl p-4 aspect-31/28 overflow-hidden">
      <div class="absolute top-4 left-8 w-16 h-2.5 bg-white/90 rounded-lg" />
      <div class="absolute top-4 right-8 w-16 h-2.5 bg-white/90 rounded-lg" />

      <div class="absolute bottom-2 left-2 w-2 h-2 bg-white/60 rounded-full" />
      <div class="absolute bottom-2 right-2 w-2 h-2 bg-white/60 rounded-full" />

      <div class="absolute top-[10%] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <Icon
          class="text-white z-10 relative"
          style="width: 7rem; height: 7rem;"
          name="i-carbon-logo-github"
        />
        <span class="text-[10px] text-white/50 mt-1 select-none">{{ styleLabels[badgeStyle] }}</span>
      </div>

      <!-- <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div
          id="canvas"
          style="width: 444px;height: 192px;"
          class="border-2 mb-4 overflow-hidden"
        />
        <div class="text-white flex flex-col justify-around">
          <Icon name="i-carbon-chevron-up" />
          <Icon name="i-carbon-chevron-down" />
        </div>
      </div> -->

      <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div
          id="canvas"
          class="border-2 border-white/20 overflow-hidden rounded-sm flex-1"
          style="height: 192px;"
        />
        <div class="text-white/80 flex flex-col justify-around">
          <button
            class="hover:text-white transition-colors p-0.5"
            title="Previous style"
            @click="cycleStyle(-1)"
          >
            <Icon name="i-carbon-chevron-up" />
          </button>
          <button
            class="hover:text-white transition-colors p-0.5"
            title="Next style"
            @click="cycleStyle(1)"
          >
            <Icon name="i-carbon-chevron-down" />
          </button>
        </div>
      </div>

      <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <button
          class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-emerald-400 transition-colors duration-200 px-3 py-1 rounded-full hover:bg-white/5"
          @click="emit('copy')"
        >
          <Icon
            name="i-carbon-download"
            class="w-3.5 h-3.5"
          />
          Copy to Badge
        </button>
      </div>
    </div>
  </div>
</template>
