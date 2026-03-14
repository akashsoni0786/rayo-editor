/**
 * Image Utility Functions
 *
 * Helper functions for working with images in the TipTap editor
 */

import type { Editor } from '@tiptap/react'
import type { ImageAlignment, ImageAttributes, ImageWithCaptionAttributes } from '../types'

/**
 * Set image alignment in the editor
 */
export function setImageAlignment(
  editor: Editor | null,
  alignment: ImageAlignment
): boolean {
  if (!editor) return false

  const { selection } = editor.state
  const node = editor.state.doc.nodeAt(selection.from)

  if (node?.type.name !== 'image') {
    return false
  }

  return editor.chain().focus().updateAttributes('image', { dataAlign: alignment }).run()
}

/**
 * Set image size in the editor
 * @param width - Width value (e.g., '50%', '300px', 300)
 * @param height - Height value (optional, defaults to 'auto')
 */
export function setImageSize(
  editor: Editor | null,
  width: string | number,
  height: string | number = 'auto'
): boolean {
  if (!editor) return false

  const { selection } = editor.state
  const node = editor.state.doc.nodeAt(selection.from)

  if (node?.type.name !== 'image') {
    return false
  }

  // Normalize width value
  const normalizedWidth = typeof width === 'number' ? `${width}px` : width

  return editor
    .chain()
    .focus()
    .updateAttributes('image', {
      width: normalizedWidth,
      height: height === 'auto' ? 'auto' : typeof height === 'number' ? `${height}px` : height,
    })
    .run()
}

/**
 * Set image caption
 */
export function setImageCaption(editor: Editor | null, caption: string): boolean {
  if (!editor) return false

  const { selection } = editor.state
  const node = editor.state.doc.nodeAt(selection.from)

  if (node?.type.name !== 'image') {
    return false
  }

  return editor.chain().focus().updateAttributes('image', { caption }).run()
}

/**
 * Remove the currently selected image
 */
export function removeImage(editor: Editor | null): boolean {
  if (!editor) return false

  const { selection } = editor.state
  const node = editor.state.doc.nodeAt(selection.from)

  if (node?.type.name !== 'image') {
    return false
  }

  return editor.chain().focus().deleteSelection().run()
}

/**
 * Get attributes of the currently selected image
 */
export function getImageAttributes(
  editor: Editor | null
): ImageWithCaptionAttributes | null {
  if (!editor) return null

  const { selection } = editor.state
  const node = editor.state.doc.nodeAt(selection.from)

  if (node?.type.name !== 'image') {
    return null
  }

  return node.attrs as ImageWithCaptionAttributes
}

/**
 * Check if current selection is an image
 */
export function isImageSelected(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.isActive('image')
}

/**
 * Insert an image at the current cursor position
 */
export function insertImage(
  editor: Editor | null,
  attrs: ImageAttributes
): boolean {
  if (!editor) return false

  return editor
    .chain()
    .focus()
    .setImage({
      src: attrs.src,
      alt: attrs.alt || '',
      title: attrs.title || '',
    })
    .run()
}

/**
 * Calculate responsive image size based on container width
 */
export function calculateResponsiveSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): { width: number; height: number } {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight }
  }

  const ratio = maxWidth / originalWidth
  return {
    width: maxWidth,
    height: Math.round(originalHeight * ratio),
  }
}

/**
 * Convert pixel width to percentage
 */
export function pixelsToPercentage(
  pixelWidth: number,
  containerWidth: number
): number {
  return Math.round((pixelWidth / containerWidth) * 100)
}

/**
 * Convert percentage width to pixels
 */
export function percentageToPixels(
  percentageWidth: number,
  containerWidth: number
): number {
  return Math.round((percentageWidth / 100) * containerWidth)
}

/**
 * Parse width value to get numeric value and unit
 */
export function parseWidthValue(width: string | number): {
  value: number
  unit: 'px' | '%' | 'auto'
} {
  if (typeof width === 'number') {
    return { value: width, unit: 'px' }
  }

  if (width === 'auto') {
    return { value: 0, unit: 'auto' }
  }

  const match = width.match(/^(\d+(?:\.\d+)?)(px|%)?$/)
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: (match[2] as 'px' | '%') || 'px',
    }
  }

  return { value: 100, unit: '%' }
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false

  // Check for data URLs
  if (url.startsWith('data:image/')) {
    return true
  }

  // Check for blob URLs
  if (url.startsWith('blob:')) {
    return true
  }

  // Check for http/https URLs
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Get image dimensions from URL
 */
export function getImageDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
