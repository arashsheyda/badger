import type { BackgroundOptions, BadgeStyle, FormData, TextPositions } from '~/types'
import { getRenderer, preloadRenderers } from '~/renderers'

interface TextRect {
  key: keyof NonNullable<TextPositions>
  textX: number
  textY: number
  x: number
  y: number
  width: number
  height: number
}

export function useBadgeCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  formData: Ref<FormData>,
  badgeStyle: Ref<BadgeStyle>,
  contributionData: Ref<number[]>,
  textPositions: Ref<TextPositions>,
) {
  const textRects: TextRect[] = []
  let dragging: { key: keyof NonNullable<TextPositions>, offsetX: number, offsetY: number } | null = null
  const padding = 4

  function getCanvasCoords(e: MouseEvent | Touch) {
    const canvas = canvasRef.value!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  function hitTest(x: number, y: number): TextRect | null {
    for (let i = textRects.length - 1; i >= 0; i--) {
      const r = textRects[i]!
      if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
        return r
      }
    }
    return null
  }

  function onMouseDown(e: MouseEvent) {
    const coords = getCanvasCoords(e)
    const hit = hitTest(coords.x, coords.y)
    if (hit) {
      dragging = {
        key: hit.key,
        offsetX: coords.x - hit.textX,
        offsetY: coords.y - hit.textY,
      }
      canvasRef.value!.style.cursor = 'grabbing'
      e.preventDefault()
    }
  }

  function clampPosition(key: keyof NonNullable<TextPositions>, x: number, y: number) {
    const canvas = canvasRef.value!
    const rect = textRects.find(r => r.key === key)
    const w = rect ? rect.width : 0
    const h = rect ? rect.height : 0
    return {
      x: Math.max(padding, Math.min(x, canvas.width - w + padding)),
      y: Math.max(padding, Math.min(y, canvas.height - h + padding)),
    }
  }

  function onMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas) return
    const coords = getCanvasCoords(e)
    if (dragging) {
      const clamped = clampPosition(
        dragging.key,
        coords.x - dragging.offsetX,
        coords.y - dragging.offsetY,
      )
      textPositions.value = {
        ...textPositions.value,
        [dragging.key]: clamped,
      }
      drawBadge()
      e.preventDefault()
    }
    else {
      const hit = hitTest(coords.x, coords.y)
      canvas.style.cursor = hit ? 'grab' : 'default'
    }
  }

  function onMouseUp() {
    if (dragging) {
      dragging = null
      if (canvasRef.value) {
        canvasRef.value.style.cursor = 'default'
      }
    }
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return
    const coords = getCanvasCoords(e.touches[0]!)
    const hit = hitTest(coords.x, coords.y)
    if (hit) {
      dragging = {
        key: hit.key,
        offsetX: coords.x - hit.textX,
        offsetY: coords.y - hit.textY,
      }
      e.preventDefault()
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging || e.touches.length !== 1) return
    const coords = getCanvasCoords(e.touches[0]!)
    const clamped = clampPosition(
      dragging.key,
      coords.x - dragging.offsetX,
      coords.y - dragging.offsetY,
    )
    textPositions.value = {
      ...textPositions.value,
      [dragging.key]: clamped,
    }
    drawBadge()
    e.preventDefault()
  }

  function onTouchEnd() {
    dragging = null
  }

  function setupDrag() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
  }

  function teardownDrag() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    canvas.removeEventListener('touchstart', onTouchStart)
    canvas.removeEventListener('touchmove', onTouchMove)
    canvas.removeEventListener('touchend', onTouchEnd)
  }

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

    const githubDefaultY = h - bottomMargin - textHeight
    const jobDefaultY = githubDefaultY - textHeight - lineHeightGap

    type TextKey = keyof NonNullable<TextPositions>
    const elements: { key: TextKey, text: string, font: string, defaultX: number, defaultY: number }[] = [
      { key: 'first', text: formData.value.first, font: 'bold 32px "Mona Sans"', defaultX: leftMargin, defaultY: topMargin },
      { key: 'last', text: formData.value.last, font: 'bold 24px "Mona Sans"', defaultX: leftMargin, defaultY: 45 },
      { key: 'job', text: job, font: `${jobFontSize}px "Mona Sans"`, defaultX: leftMargin, defaultY: jobDefaultY },
      { key: 'github', text: github, font: `${jobFontSize}px "Mona Sans"`, defaultX: leftMargin, defaultY: githubDefaultY },
    ]

    textRects.length = 0
    const drawn: { font: string, text: string, x: number, y: number, cx: number, cy: number, cw: number, ch: number }[] = []

    for (const el of elements) {
      if (!el.text) continue
      ctx.font = el.font
      const metrics = ctx.measureText(el.text)
      const tw = metrics.width
      const th = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

      const pos = textPositions.value[el.key]
      const x = pos?.x ?? el.defaultX
      const y = pos?.y ?? el.defaultY

      textRects.push({
        key: el.key,
        textX: x,
        textY: y,
        x: x - padding,
        y: y - padding,
        width: tw + padding * 2,
        height: th + padding * 2,
      })

      drawn.push({
        font: el.font,
        text: el.text,
        x,
        y,
        cx: x - padding,
        cy: y - padding,
        cw: tw + padding * 2,
        ch: th + padding * 2,
      })
    }

    // Clear zones behind text
    ctx.fillStyle = '#ffffff'
    for (const d of drawn) {
      ctx.fillRect(d.cx, d.cy, d.cw, d.ch)
    }

    // Draw text
    ctx.fillStyle = '#000000'
    for (const d of drawn) {
      ctx.font = d.font
      ctx.fillText(d.text, d.x, d.y)
    }

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

  return { drawBadge, init, setupDrag, teardownDrag }
}
