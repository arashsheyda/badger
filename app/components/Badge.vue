<template>
  <div class="relative bg-black w-[31rem] h-[28rem] rounded-lg p-4">
    <div class="absolute top-4 left-8 w-16 h-2.5 bg-white rounded-lg" />
    <div class="absolute top-4 right-8 w-16 h-2.5 bg-white rounded-lg" />

    <div class="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full" />
    <div class="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full" />

    <div class="absolute top-12 left-1/2 transform -translate-x-1/2">
      <Icon
        class="w-28 h-28 text-white z-10 relative"
        name="i-carbon-logo-github"
      />
    </div>

    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
      <slot name="canvas">
        <div
          style="width: 444px;height: 192px;"
          class="border-2 mb-4"
        />
      </slot>
      <div class="text-white flex flex-col justify-around">
        <Icon name="i-carbon-chevron-up" />
        <Icon name="i-carbon-chevron-down" />
      </div>
    </div>

    <div class="absolute bottom-[3px] left-1/2 transform -translate-x-1/2 flex gap-2 justify-around w-full text-white text-xs items-center">
      <button class="text-yellow-500 hover:text-green-500 transition-all duration-300 p-1">
        <Icon name="i-carbon-download" />
        Copy to Badge
      </button>
    </div>
  </div>
</template>
