import type { ImageMetadata, ImageOutputFormat, ImageQuality } from 'astro'
import { getImage } from 'astro:assets'

export interface OptimizedImageAsset {
  src: string
  width: number
  height: number
}

export interface OptimizeImageOptions {
  maxWidth?: number
  format?: ImageOutputFormat
  quality?: ImageQuality
}

export const IMAGE_PRESET = {
  widths: [300, 450, 700, 1100],
  sizes: '(max-width: 320px) 300px, (max-width: 480px) 450px, (max-width: 768px) 700px, (max-width: 1200px) 1100px',
  format: 'webp',
  quality: 80,
}

export function getResponsiveWidths(src: ImageMetadata | undefined): number[] {
  return src ? [...new Set([...IMAGE_PRESET.widths.filter(width => width <= src.width), src.width])] : IMAGE_PRESET.widths
}

export function getResponsiveSizes(src: ImageMetadata | undefined): string {
  return src ? `${IMAGE_PRESET.sizes}, ${src.width}px` : IMAGE_PRESET.sizes
}

export async function optimizeImage(image: ImageMetadata | undefined, options: OptimizeImageOptions = {}): Promise<OptimizedImageAsset | undefined> {
  if (!image)
    return undefined

  const optimized = await getImage({
    src: image,
    width: Math.min(image.width, options.maxWidth ?? Math.max(...IMAGE_PRESET.widths)),
    format: options.format ?? IMAGE_PRESET.format,
    quality: options.quality ?? IMAGE_PRESET.quality,
  })

  return { src: optimized.src, width: image.width, height: image.height }
}
