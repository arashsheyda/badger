import type { BackgroundOptions, BadgeStyle, FormData } from '~/types'
import { getRenderer, preloadRenderers } from '~/renderers'

export function useBadgeCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  formData: Ref<FormData>,
  badgeStyle: Ref<BadgeStyle>,
  contributionData: Ref<number[]>,
) {
  function drawBadge() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const leftMargin = 10
    const topMargin = 10
    const bottomMargin = 10

    const options: BackgroundOptions = {
      github: formData.value.github,
      contributionData: contributionData.value,
    }

    getRenderer(badgeStyle.value).draw(ctx, w, h, options)

    ctx.textBaseline = 'top'

    // Measure text for clear zones
    ctx.font = 'bold 32px "Mona Sans"'
    const firstWidth = ctx.measureText(formData.value.first).width

    ctx.font = 'bold 24px "Mona Sans"'
    const lastWidth = ctx.measureText(formData.value.last).width

    const nameBlockWidth = Math.max(firstWidth, lastWidth) + leftMargin + 8
    const nameBlockHeight = 75

    let github = formData.value.github
    if (github && !github.startsWith('@')) {
      github = '@' + github
    }

    let jobFontSize = 16
    const job = formData.value.job
    if (job) {
      ctx.font = `${jobFontSize}px "Mona Sans"`
      while (ctx.measureText(job).width > w - 40 && jobFontSize > 8) {
        jobFontSize--
        ctx.font = `${jobFontSize}px "Mona Sans"`
      }
    }

    ctx.font = `${jobFontSize}px "Mona Sans"`
    const fontMetrics = ctx.measureText('Jobby')
    const textHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent
    const lineHeightGap = textHeight * 0.3

    const githubY = h - bottomMargin - textHeight
    const jobY = githubY - textHeight - lineHeightGap

    const jobWidth = ctx.measureText(job).width
    const githubWidth = ctx.measureText(github).width
    const bottomBlockWidth = Math.max(jobWidth, githubWidth) + leftMargin + 8
    const bottomBlockHeight = h - jobY + 4

    // Clear zones behind text
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, nameBlockWidth, nameBlockHeight)
    ctx.fillRect(0, jobY - 4, bottomBlockWidth, bottomBlockHeight)

    // Draw text
    ctx.font = 'bold 32px "Mona Sans"'
    ctx.fillStyle = '#000000'
    ctx.fillText(formData.value.first, leftMargin, topMargin)

    ctx.font = 'bold 24px "Mona Sans"'
    ctx.fillText(formData.value.last, leftMargin, 45)

    ctx.font = `${jobFontSize}px "Mona Sans"`
    ctx.fillText(job, leftMargin, jobY)
    ctx.fillText(github, leftMargin, githubY)

    // Convert to 2-bit B&W
    const imageData = ctx.getImageData(0, 0, w, h)
    const bwCanvas = convertTo2BitBW(imageData)
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(bwCanvas, 0, 0)
  }

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

  async function init() {
    await Promise.all([
      document.fonts.ready,
      preloadRenderers(),
    ])
  }

  return { drawBadge, init }
}
