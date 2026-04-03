import type { BackgroundOptions, BackgroundRenderer } from '~/types'
import { hashCode } from '~/utils/hash'

export const skylineRenderer: BackgroundRenderer = {
  draw(ctx, w, h, options: BackgroundOptions) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    const data = options.contributionData

    const weekTotals: number[] = []
    if (data.length > 0) {
      for (let i = 0; i < data.length; i += 7) {
        const week = data.slice(i, i + 7)
        weekTotals.push(week.reduce((a, b) => a + b, 0))
      }
    }
    else {
      const seed = hashCode(options.github || 'mona')
      for (let i = 0; i < 52; i++) {
        weekTotals.push(Math.abs((seed * (i + 1) * 2654435761) >> 24) % 28)
      }
    }

    const maxTotal = Math.max(...weekTotals, 1)
    const barCount = weekTotals.length
    const gap = 1
    const barWidth = Math.max(2, Math.floor((w - gap * (barCount - 1)) / barCount))
    const groundY = h - 2
    const maxBarHeight = h * 0.85

    ctx.fillStyle = '#000000'

    for (let i = 0; i < barCount; i++) {
      const ratio = weekTotals[i]! / maxTotal
      const barHeight = Math.max(ratio > 0 ? 2 : 0, Math.round(ratio * maxBarHeight))
      const x = i * (barWidth + gap)
      const y = groundY - barHeight

      ctx.fillRect(x, y, barWidth, barHeight)

      if (barHeight > 12 && barWidth >= 4) {
        ctx.fillStyle = '#ffffff'
        const windowSize = Math.max(1, Math.floor(barWidth * 0.3))
        const windowGap = Math.max(2, windowSize + 1)
        for (let wy = y + 3; wy < groundY - 3; wy += windowGap) {
          ctx.fillRect(x + 1, wy, windowSize, windowSize)
          if (barWidth >= 6) {
            ctx.fillRect(x + barWidth - windowSize - 1, wy, windowSize, windowSize)
          }
        }
        ctx.fillStyle = '#000000'
      }
    }

    ctx.fillRect(0, groundY, w, 2)
  },
}
