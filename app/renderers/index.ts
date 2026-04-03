import type { BackgroundRenderer, BadgeStyle } from '~/types'
import { contributionsRenderer } from './contributions'
import { createDefaultRenderer } from './default'
import { skylineRenderer } from './skyline'

const defaultRenderer = createDefaultRenderer()

const renderers: Record<BadgeStyle, BackgroundRenderer> = {
  default: defaultRenderer,
  contributions: contributionsRenderer,
  skyline: skylineRenderer,
}

export function getRenderer(style: BadgeStyle): BackgroundRenderer {
  return renderers[style] ?? renderers.default
}

export function preloadRenderers(): Promise<void> {
  return defaultRenderer.preload()
}
