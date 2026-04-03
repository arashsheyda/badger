<script setup lang="ts">
import type { FormData } from '~/types'

const formData = ref<FormData>({
  github: '',
  first: '',
  last: '',
  company: '',
  job: '',
  pronouns: '',
})

const screen = useTemplateRef('screen')

function handleCopyToBadge() {
  screen.value?.copyToBadge()
}
</script>

<template>
  <Html>
    <Body class="bg-linear-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
      <NuxtRouteAnnouncer />
      <main class="min-h-screen pb-20">
        <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <header class="text-center mb-10">
            <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              Badger Press
            </h1>
            <p class="mt-2 text-gray-500 text-sm sm:text-base">
              Design your conference badge in seconds
            </p>
          </header>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            <ClientOnly>
              <Screen
                ref="screen"
                v-model:form="formData"
              />
            </ClientOnly>

            <div class="flex flex-col gap-6 items-center justify-start lg:sticky lg:top-8">
              <Badge @copy="handleCopyToBadge" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </Body>
  </Html>
</template>
