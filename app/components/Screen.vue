<script setup lang="ts">
import type { BadgeStyle, FormData, TextPositions } from '~/types'

const formData = defineModel<any>('form', {
  required: true,
})

const badgeStyle = defineModel<BadgeStyle>('badgeStyle', {
  required: true,
})

const badgeCanvas = useTemplateRef('badgeCanvas')

const textPositions = useCookie<TextPositions>('badger-positions', {
  maxAge: 60 * 60 * 24 * 365,
  default: () => ({}),
})

const hasCustomPositions = computed(() => Object.keys(textPositions.value).length > 0)

const { contributionData, handleGitHubInput, fetchContributions, loading } = useGitHub(
  formData,
  badgeStyle,
  () => drawBadge(),
)

const { drawBadge, init, setupDrag, teardownDrag } = useBadgeCanvas(
  badgeCanvas,
  formData,
  badgeStyle,
  contributionData,
  textPositions,
)

const { copyToBadge } = useSerial(badgeCanvas)

function resetLayout() {
  textPositions.value = {}
  drawBadge()
}

function getQueryParams() {
  if (import.meta.client) {
    const params = new URLSearchParams(window.location.search)
    return Object.fromEntries(params)
  }
  return {}
}

function setInputValues(data: Partial<FormData>) {
  Object.keys(data).forEach((key) => {
    if (key in formData.value) {
      formData.value[key as keyof FormData] = data[key as keyof FormData] || ''
    }
  })
}

function loadInitialData() {
  const queryParams = getQueryParams()

  if (Object.keys(queryParams).length > 0) {
    setInputValues(queryParams)
  }
  else if (!formData.value.github) {
    formData.value.github = 'mona'
  }

  handleGitHubInput()
  drawBadge()
}

watch(formData, () => {
  drawBadge()
}, { deep: true })

watch(badgeStyle, () => {
  if (badgeStyle.value === 'contributions' || badgeStyle.value === 'skyline') {
    fetchContributions()
  }
  else {
    drawBadge()
  }
})

onMounted(async () => {
  await init()
  setupDrag()
  loadInitialData()
  window.addEventListener('resize', drawBadge)
})

onBeforeUnmount(() => {
  teardownDrag()
  window.removeEventListener('resize', drawBadge)
})

defineExpose({ copyToBadge })
</script>

<template>
  <div class="w-full">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sm:p-8 space-y-5">
      <h2 class="text-lg font-semibold text-gray-800">
        Badge Details
      </h2>

      <div class="form-group relative">
        <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">GitHub Handle</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon
              name="i-carbon-logo-github"
              class="w-5 h-5"
            />
          </span>
          <input
            v-model="formData.github"
            type="text"
            placeholder="mona"
            class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
            @input="handleGitHubInput"
          >
        </div>
      </div>
      <template v-if="loading">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="i in 2"
            :key="i"
            class="form-group"
          >
            <div class="h-3.5 w-20 bg-gray-200 rounded animate-pulse mb-2" />
            <div class="h-10 bg-gray-100 border border-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="i in 2"
            :key="i"
            class="form-group"
          >
            <div class="h-3.5 w-20 bg-gray-200 rounded animate-pulse mb-2" />
            <div class="h-10 bg-gray-100 border border-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
        <div class="form-group">
          <div class="h-3.5 w-16 bg-gray-200 rounded animate-pulse mb-2" />
          <div class="h-10 bg-gray-100 border border-gray-200 rounded-xl animate-pulse" />
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">First Name</label>
            <input
              v-model="formData.first"
              type="text"
              placeholder="Mona"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
            >
          </div>
          <div class="form-group">
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Last Name</label>
            <input
              v-model="formData.last"
              type="text"
              placeholder="Lisa"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
            >
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Company</label>
            <input
              v-model="formData.company"
              type="text"
              placeholder="GitHub"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
            >
          </div>
          <div class="form-group">
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Job Title</label>
            <input
              v-model="formData.job"
              type="text"
              placeholder="Octocat"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Pronouns</label>
          <input
            v-model="formData.pronouns"
            type="text"
            placeholder="they/them"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white"
          >
        </div>
      </template>

      <button
        v-if="hasCustomPositions"
        type="button"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
        @click="resetLayout"
      >
        <Icon
          name="i-carbon-reset"
          class="w-3.5 h-3.5"
        />
        Reset layout
      </button>
    </div>
  </div>
  <Teleport to="#canvas">
    <canvas
      ref="badgeCanvas"
      width="444"
      height="192"
      class=""
    />
  </Teleport>
</template>
