export interface FormData {
  github: string
  first: string
  last: string
  company: string
  job: string
  pronouns: string
}

export type BadgeStyle = 'default' | 'contributions' | 'skyline'

export interface BackgroundRenderer {
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, options: BackgroundOptions) => void
}

export interface BackgroundOptions {
  github: string
  contributionData: number[]
}
