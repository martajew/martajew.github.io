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

export const IMAGE_BREAKPOINTS = [300, 450, 700, 1100, 1600, 2200]

export const CMS_IMAGE_PRESET: { widths: number[], sizes: string, format: ImageOutputFormat, quality: ImageQuality } = {
  widths: IMAGE_BREAKPOINTS.filter(width => width <= 1600),
  sizes: '(max-width: 320px) 300px, (max-width: 480px) 450px, (max-width: 768px) 700px, (max-width: 1200px) 1100px, 1600px',
  format: 'webp',
  quality: 80,
}

export function getResponsiveWidths(src: { width: number } | undefined): number[] {
  if (!src)
    return CMS_IMAGE_PRESET.widths

  return [...new Set([...CMS_IMAGE_PRESET.widths.filter(width => width <= src.width), src.width])]
}

export async function optimizeImage(image: ImageMetadata | undefined, options: OptimizeImageOptions = {}): Promise<OptimizedImageAsset | undefined> {
  if (!image)
    return undefined

  const optimized = await getImage({
    src: image,
    width: Math.min(image.width, options.maxWidth ?? Math.max(...IMAGE_BREAKPOINTS)),
    format: options.format ?? CMS_IMAGE_PRESET.format,
    quality: options.quality ?? CMS_IMAGE_PRESET.quality,
  })

  return {
    src: optimized.src,
    width: image.width,
    height: image.height,
  }
}
