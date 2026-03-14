/**
 * Resizable Image with Caption Extension
 *
 * Extends the base TipTap Image extension with:
 * - Width and height attributes for resizing
 * - Alignment (left, center, right)
 * - Caption support with placement options
 * - Pending delete/insert states for diff visualization
 */

import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImageWithCaption } from '../nodes/resizable-image-caption-node'
import type { ImageAlignment } from '../types'

export interface ResizableImageWithCaptionOptions {
  /** Default alignment for new images */
  defaultAlignment?: ImageAlignment
  /** Default caption placement */
  defaultCaptionPlacement?: 'above' | 'below'
  /** Allow base64 images */
  allowBase64?: boolean
  /** HTML attributes for the image wrapper */
  HTMLAttributes?: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImageWithCaption: {
      /**
       * Set image alignment
       */
      setImageAlignment: (alignment: ImageAlignment) => ReturnType
      /**
       * Set image size
       */
      setImageSize: (width: string | number, height?: string | number) => ReturnType
      /**
       * Set image caption
       */
      setImageCaption: (caption: string) => ReturnType
      /**
       * Remove image caption
       */
      removeImageCaption: () => ReturnType
    }
  }
}

export const ResizableImageWithCaptionExtension = Image.extend<ResizableImageWithCaptionOptions>({
  name: 'image',

  addOptions() {
    return {
      ...this.parent?.(),
      defaultAlignment: 'center' as ImageAlignment,
      defaultCaptionPlacement: 'below' as const,
      allowBase64: true,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),

      // Width attribute - defaults to null (natural size, centered)
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width') || element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },

      // Height attribute
      height: {
        default: 'auto',
        parseHTML: (element) => element.getAttribute('height') || element.style.height || 'auto',
        renderHTML: (attributes) => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },

      // Alignment attribute
      dataAlign: {
        default: this.options.defaultAlignment,
        parseHTML: (element) => element.getAttribute('data-align') || this.options.defaultAlignment,
        renderHTML: (attributes) => {
          return { 'data-align': attributes.dataAlign }
        },
      },

      // Caption text
      caption: {
        default: '',
        parseHTML: (element) => {
          const figcaption = element.querySelector('figcaption')
          return figcaption?.textContent || element.getAttribute('data-caption') || ''
        },
        renderHTML: (attributes) => {
          if (!attributes.caption) return {}
          return { 'data-caption': attributes.caption }
        },
      },

      // Caption placement (above or below image)
      captionPlacement: {
        default: this.options.defaultCaptionPlacement,
        parseHTML: (element) => element.getAttribute('data-caption-placement') || this.options.defaultCaptionPlacement,
        renderHTML: (attributes) => {
          return { 'data-caption-placement': attributes.captionPlacement }
        },
      },

      // Pending delete state (for diff visualization)
      pendingDelete: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-pending-delete') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.pendingDelete) return {}
          return { 'data-pending-delete': 'true' }
        },
      },

      // Pending insert state (for diff visualization)
      pendingInsert: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-pending-insert') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.pendingInsert) return {}
          return { 'data-pending-insert': 'true' }
        },
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),

      setImageAlignment:
        (alignment: ImageAlignment) =>
        ({ commands, state }) => {
          const { selection } = state
          const node = state.doc.nodeAt(selection.from)

          if (node?.type.name !== 'image') {
            return false
          }

          return commands.updateAttributes('image', { dataAlign: alignment })
        },

      setImageSize:
        (width: string | number, height?: string | number) =>
        ({ commands, state }) => {
          const { selection } = state
          const node = state.doc.nodeAt(selection.from)

          if (node?.type.name !== 'image') {
            return false
          }

          const attrs: Record<string, unknown> = { width }
          if (height !== undefined) {
            attrs.height = height
          } else {
            attrs.height = 'auto'
          }

          return commands.updateAttributes('image', attrs)
        },

      setImageCaption:
        (caption: string) =>
        ({ commands, state }) => {
          const { selection } = state
          const node = state.doc.nodeAt(selection.from)

          if (node?.type.name !== 'image') {
            return false
          }

          return commands.updateAttributes('image', { caption })
        },

      removeImageCaption:
        () =>
        ({ commands, state }) => {
          const { selection } = state
          const node = state.doc.nodeAt(selection.from)

          if (node?.type.name !== 'image') {
            return false
          }

          return commands.updateAttributes('image', { caption: '' })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageWithCaption)
  },

  // Parse figure elements with figcaption
  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (dom) => {
          const element = dom as HTMLElement
          const img = element.querySelector('img')
          const figcaption = element.querySelector('figcaption')

          if (!img) return false

          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width') || img.style.width,
            height: img.getAttribute('height') || img.style.height,
            dataAlign: element.getAttribute('data-align') || 'center',
            caption: figcaption?.textContent || '',
            captionPlacement: element.getAttribute('data-caption-placement') || 'below',
          }
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          const element = dom as HTMLImageElement
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            width: element.getAttribute('width') || element.style.width,
            height: element.getAttribute('height') || element.style.height,
            dataAlign: element.getAttribute('data-align') || 'center',
          }
        },
      },
    ]
  },

  // Render as figure with optional figcaption
  renderHTML({ HTMLAttributes }) {
    const { caption, captionPlacement, ...imgAttrs } = HTMLAttributes

    // If no caption, render simple img
    if (!caption) {
      return ['img', imgAttrs]
    }

    // Render figure with figcaption
    const figureAttrs = {
      'data-align': imgAttrs['data-align'],
      'data-caption-placement': captionPlacement,
    }

    const imgElement = ['img', imgAttrs]
    const captionElement = ['figcaption', {}, caption]

    const children =
      captionPlacement === 'above' ? [captionElement, imgElement] : [imgElement, captionElement]

    return ['figure', figureAttrs, ...children]
  },
})

export default ResizableImageWithCaptionExtension
