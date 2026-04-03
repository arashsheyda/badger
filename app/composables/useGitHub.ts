import { useDebounceFn } from '@vueuse/core'
import type { BadgeStyle, FormData } from '~/types'

export function useGitHub(
  formData: Ref<FormData>,
  badgeStyle: Ref<BadgeStyle>,
  onUpdate: () => void,
) {
  const contributionData = ref<number[]>([])
  const loading = ref<boolean>(false)

  const handleGitHubInput = useDebounceFn(async () => {
    const username = formData.value.github.trim().replace(/^@/, '')
    if (username) {
      loading.value = true
      const userData = await fetchUser(username)
      applyUserData(userData)
      loading.value = false
    }
  }, 250)

  async function fetchUser(username: string) {
    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`)
      if (!response.ok) throw new Error('User not found')
      return await response.json()
    }
    catch (error) {
      console.error('Error fetching GitHub user:', error)
      return null
    }
  }

  async function fetchContributions() {
    const username = formData.value.github?.trim().replace(/^@/, '') || 'mona'
    try {
      const data = await $fetch<{ levels: number[] }>('/api/contributions', {
        params: { username },
      })
      contributionData.value = data.levels
    }
    catch {
      contributionData.value = []
    }
    onUpdate()
  }

  function applyUserData(data: any) {
    if (!data) return

    if (data.name) {
      const nameParts = data.name.split(' ')
      formData.value.first = nameParts[0]
      formData.value.last = nameParts.slice(1).join(' ')
    }

    if (data.company) {
      formData.value.company = data.company.replace(/^@/, '')
    }

    if (data.bio) {
      formData.value.job = data.bio.replace(/\s*@\w+$/, '').split('.')[0].trim()
    }

    onUpdate()

    if (badgeStyle.value === 'contributions' || badgeStyle.value === 'skyline') {
      fetchContributions()
    }
  }

  return {
    loading,
    contributionData,
    handleGitHubInput,
    fetchContributions,
  }
}
