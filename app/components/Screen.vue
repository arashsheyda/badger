<script setup lang="ts">
import type { BadgeStyle, FormData } from '~/types'

const formData = defineModel<any>('form', {
  required: true,
})

const badgeStyle = defineModel<BadgeStyle>('badgeStyle', {
  required: true,
})

const badgeCanvas = useTemplateRef('badgeCanvas')

const { contributionData, handleGitHubInput, fetchContributions } = useGitHub(
  formData,
  badgeStyle,
  () => drawBadge(),
)

const { drawBadge, init } = useBadgeCanvas(
  badgeCanvas,
  formData,
  badgeStyle,
  contributionData,
)

const { copyToBadge } = useSerial(badgeCanvas)

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
  else {
    setInputValues({
      first: 'Mona',
      last: 'Lisa',
      company: 'GitHub',
      job: 'Octocat',
      pronouns: '',
      github: 'mona',
    })
  }

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
  loadInitialData()
  window.addEventListener('resize', drawBadge)
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
            <Icon name="i-carbon-logo-github" class="w-5 h-5" />
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
