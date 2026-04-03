import type { BackgroundRenderer } from '~/types'

export const defaultRenderer: BackgroundRenderer = {
  draw(ctx, w, h) {
    const img = new Image()
    img.src = '/back.png'
    ctx.drawImage(img, 0, 0, w, h)
  },
}

let backgroundImage: HTMLImageElement | null = null

export function createDefaultRenderer(): BackgroundRenderer & { preload: () => Promise<void> } {
  return {
    async preload() {
      if (backgroundImage) return
      backgroundImage = new Image()
      backgroundImage.src = '/back.png'
      await new Promise(resolve => (backgroundImage!.onload = resolve))
    },
    draw(ctx, w, h) {
      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, w, h)
      }
      else {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
      }
    },
  }
}
