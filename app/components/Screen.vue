<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import type { FormData } from '~/types'

const formData = defineModel<any>('form', {
  required: true,
})

const fullString = ref('')
const badgeCanvas = useTemplateRef('badgeCanvas')

const backgroundImage = new Image()
backgroundImage.src = '/back.png'

// Function to get query parameters
function getQueryParams() {
  if (import.meta.client) {
    const params = new URLSearchParams(window.location.search)
    return Object.fromEntries(params)
  }
  return {}
}

// Function to set input values
function setInputValues(data: Partial<FormData>) {
  Object.keys(data).forEach((key) => {
    if (key in formData.value) {
      formData.value[key as keyof FormData] = data[key as keyof FormData] || ''
    }
  })
}

// Function to load initial data
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

  updateFullString()
}

// Function to update full string
function updateFullString() {
  const id = '01234567890'
  const fieldOrder: (keyof FormData)[] = ['first', 'last', 'company', 'job', 'pronouns', 'github']

  const orderedValues = fieldOrder.map((field) => {
    if (field === 'github' && formData.value[field]) {
      return `@${formData.value[field]}`
    }
    return formData.value[field]
  })

  fullString.value = `${id}iD^${orderedValues.join('^')}^`
  drawBadge()
}

// Function to draw badge
function drawBadge() {
  if (!badgeCanvas.value) return
  const ctx = badgeCanvas.value.getContext('2d')
  if (!ctx) return

  const bottomMargin = 10
  const leftMargin = 10
  const topMargin = 10

  ctx.drawImage(backgroundImage, 0, 0, badgeCanvas.value.width, badgeCanvas.value.height)
  ctx.textBaseline = 'top'

  // Draw first name in bold
  ctx.font = 'bold 32px "Mona Sans"'
  ctx.fillStyle = '#000000'
  ctx.fillText(formData.value.first, leftMargin, topMargin)

  // Draw last name in bold
  ctx.font = 'bold 24px "Mona Sans"'
  ctx.fillText(formData.value.last, leftMargin, 45)

  // Get GitHub handle
  let github = formData.value.github
  if (github && !github.startsWith('@')) {
    github = '@' + github
  }

  // Calculate dynamic font size for job title
  let jobFontSize = 16
  const job = formData.value.job

  if (job) {
    ctx.font = `${jobFontSize}px "Mona Sans"`
    while (ctx.measureText(job).width > badgeCanvas.value.width - 40 && jobFontSize > 8) {
      jobFontSize--
      ctx.font = `${jobFontSize}px "Mona Sans"`
    }
  }

  // Calculate text metrics
  ctx.font = `${jobFontSize}px "Mona Sans"`
  const fontMetrics = ctx.measureText('Jobby')
  const textHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent
  const lineHeightGap = textHeight * 0.3

  const githubY = badgeCanvas.value.height - bottomMargin - textHeight
  const jobY = githubY - textHeight - lineHeightGap

  // Draw the text
  ctx.fillText(job, leftMargin, jobY)
  ctx.fillText(github, leftMargin, githubY)

  // Convert to 2-bit black and white
  const imageData = ctx.getImageData(0, 0, badgeCanvas.value.width, badgeCanvas.value.height)
  const bwCanvas = convertTo2BitBW(imageData)
  ctx.clearRect(0, 0, badgeCanvas.value.width, badgeCanvas.value.height)
  ctx.drawImage(bwCanvas, 0, 0)
}

// Function to convert image to 2-bit black and white
function convertTo2BitBW(imageData: ImageData): HTMLCanvasElement {
  const threshold = 200
  const newCanvas = document.createElement('canvas')
  newCanvas.width = imageData.width
  newCanvas.height = imageData.height
  const ctx = newCanvas.getContext('2d')
  if (!ctx) return newCanvas

  const newImageData = ctx.createImageData(imageData.width, imageData.height)

  for (let i = 0; i < imageData.data.length; i += 4) {
    const gray = imageData.data[i]! * 0.2627
      + imageData.data[i + 1]! * 0.678
      + imageData.data[i + 2]! * 0.0593

    const bw = gray < threshold ? 0 : 255

    newImageData.data[i] = bw
    newImageData.data[i + 1] = bw
    newImageData.data[i + 2] = bw
    newImageData.data[i + 3] = 255
  }

  ctx.putImageData(newImageData, 0, 0)
  return newCanvas
}

// Function to copy to badge
async function copyToBadge() {
  if (!import.meta.client || !('serial' in navigator)) {
    alert('Web Serial API not supported in this browser.')
    return
  }

  try {
    const port = await (navigator as any).serial.requestPort()
    await port.open({ baudRate: 115200 })

    const encoder = new TextEncoderStream()
    const writableStreamClosed = encoder.readable.pipeTo(port.writable)
    const writer = encoder.writable.getWriter()

    const decoder = new TextDecoderStream()
    const readableStreamClosed = port.readable.pipeTo(decoder.writable)
    const reader = decoder.readable.getReader()

    // Helper function to send data
    async function sendCommand(command: string) {
      await writer.write(command + '\r\n')
    }

    // Enter raw REPL mode in Micropython
    await sendCommand('\x03')
    await sendCommand('\x01')
    await sendCommand('')

    // Prepare Python code
    const pythonCode = `import badger2040
import pngdec

display = badger2040.Badger2040()
png = pngdec.PNG(display.display)

display.led(128)
display.clear()

try:
    png.open_file("badge.png")
    png.decode()
except (OSError, RuntimeError):
    print("Badge background error")

display.update()`

    // Get canvas image data
    if (!badgeCanvas.value) return
    const imageBlob = await new Promise<Blob>(resolve => badgeCanvas.value?.toBlob(blob => resolve(blob!), 'image/png'))
    const imageArrayBuffer = await imageBlob.arrayBuffer()
    const imageUint8Array = new Uint8Array(imageArrayBuffer)

    // Send main.py
    await sendCommand(`f = open('main.py', 'w')`)
    const pythonLines = pythonCode.split('\n')
    for (const line of pythonLines) {
      await sendCommand(`f.write('${line}\\n')`)
    }
    await sendCommand(`f.close()`)

    // Send badge.png
    await sendCommand(`f = open('badge.png', 'wb')`)
    const chunkSize = 256
    for (let i = 0; i < imageUint8Array.length; i += chunkSize) {
      const chunk = imageUint8Array.slice(i, i + chunkSize)
      const hexString = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join('')
      await sendCommand(`f.write(bytes.fromhex('${hexString}'))`)
    }
    await sendCommand(`f.close()`)

    // Reset device
    await sendCommand('import machine; machine.reset()')

    // Exit raw REPL mode
    await sendCommand('\x04')

    // Close streams and port
    writer.close()
    await writableStreamClosed
    reader.cancel()
    await readableStreamClosed
    await port.close()
  }
  catch (error) {
    console.error('Error:', error)
  }
}

const handleGitHubInput = useDebounceFn(async () => {
  const username = formData.value.github.trim().replace(/^@/, '')
  if (username) {
    const userData = await fetchGitHubUser(username)
    updateFormWithGitHubData(userData)
  }
}, 250)

async function fetchGitHubUser(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`)
    if (!response.ok) throw new Error('User not found')
    return await response.json()
  }
  catch (error) {
    console.error('Error fetching GitHub user:', error)
    return null
  }
}

function cleanJob(title: string) {
  return title.replace(/\s*@\w+$/, '').trim()
}

function updateFormWithGitHubData(data: any) {
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
    formData.value.job = cleanJob(data.bio.split('.')[0].trim())
  }

  updateFullString()
}

// Watch for changes
watch(formData, () => {
  updateFullString()
}, { deep: true })

// Initialize
onMounted(() => {
  Promise.all([
    document.fonts.ready,
    new Promise(resolve => backgroundImage.onload = resolve),
  ]).then(() => {
    loadInitialData()
  })

  window.addEventListener('resize', drawBadge)
})

defineExpose({ copyToBadge })
</script>

<template>
  <div class="input-section flex-1">
    <h1 class="text-3xl font-bold mb-6">
      Badger Press
    </h1>
    <div class="space-y-4">
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">GitHub Handle</label>
        <input
          v-model="formData.github"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="handleGitHubInput"
        >
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            v-model="formData.first"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="updateFullString"
          >
        </div>
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            v-model="formData.last"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="updateFullString"
          >
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            v-model="formData.company"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="updateFullString"
          >
        </div>
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input
            v-model="formData.job"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="updateFullString"
          >
        </div>
      </div>
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-1">Pronouns</label>
        <input
          v-model="formData.pronouns"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="updateFullString"
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
