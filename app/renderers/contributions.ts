import type { BackgroundOptions, BackgroundRenderer } from '~/types'
import { hashCode } from '~/utils/hash'

export const contributionsRenderer: BackgroundRenderer = {
  draw(ctx, w, h, options: BackgroundOptions) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    const cellSize = 6
    const gap = 2
    const step = cellSize + gap
    const cols = Math.floor(w / step)
    const rows = Math.floor(h / step)

    const shades = ['#ffffff', '#c0c0c0', '#808080', '#404040', '#000000']

    const offsetX = Math.floor((w - cols * step + gap) / 2)
    const offsetY = Math.floor((h - rows * step + gap) / 2)

    const data = options.contributionData

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const idx = col * rows + row
        let level: number
        if (data.length > 0) {
          level = data[idx % data.length]!
        }
        else {
          const seed = hashCode(options.github || 'mona')
          level = Math.abs((seed * (idx + 1) * 2654435761) >> 28) % 5
        }
        if (level === 0) continue
        ctx.fillStyle = shades[level]!
        const x = offsetX + col * step
        const y = offsetY + row * step
        const r = 1
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + cellSize - r, y)
        ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + r)
        ctx.lineTo(x + cellSize, y + cellSize - r)
        ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - r, y + cellSize)
        ctx.lineTo(x + r, y + cellSize)
        ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.fill()
      }
    }
  },
}
