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
    <Body class="bg-gray-100">
      <NuxtRouteAnnouncer />
      <main class="min-h-screen">
        <div class="container mx-auto p-4">
          <div class="grid grid-cols-2 gap-8">
            <!-- form -->
            <ClientOnly>
              <Screen
                ref="screen"
                v-model:form="formData"
              />
            </ClientOnly>

            <div class="flex flex-col gap-4 items-center justify-center">
              <Badge @copy="handleCopyToBadge" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </Body>
  </Html>
</template>
