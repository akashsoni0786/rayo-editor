import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImageNode } from '../tiptap-node/resizable-image-node/resizable-image-node'

export const ResizableImageExtension = Image.extend({
  name: 'image',

  // Ensure the node is selectable
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.style.width || element.getAttribute('width') || null
          if (!width) return null
          // Preserve percentage values as-is (e.g., '100%') - don't parseInt them
          if (typeof width === 'string' && width.includes('%')) return width
          return Number.parseInt(width, 10) || width
        },
        renderHTML: attributes => {
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: 'auto',
        renderHTML: attributes => {
          return {
            height: attributes.height,
          }
        },
      },
      dataAlign: {
        default: 'center', // 'left', 'center', 'right'
        parseHTML: element => element.getAttribute('data-align') || element.getAttribute('align'),
        renderHTML: attributes => {
          return {
            'data-align': attributes.dataAlign,
          }
        },
      },
      pendingDelete: {
        default: false,
        parseHTML: element => element.getAttribute('data-pending-delete') === 'true',
        renderHTML: attributes => {
          if (!attributes.pendingDelete) return {}
          return {
            'data-pending-delete': 'true',
          }
        },
      },
      pendingInsert: {
        default: false,
        parseHTML: element => element.getAttribute('data-pending-insert') === 'true',
        renderHTML: attributes => {
          if (!attributes.pendingInsert) return {}
          return {
            'data-pending-insert': 'true',
          }
        },
      },
      caption: {
        default: '',
        parseHTML: element => {
          // First check for data-caption attribute
          const dataCaption = element.getAttribute('data-caption')
          if (dataCaption) return dataCaption

          // Check if parent is a figure element with figcaption
          const parent = element.parentElement
          if (parent?.tagName?.toLowerCase() === 'figure') {
            const figcaption = parent.querySelector('figcaption')
            if (figcaption) {
              return figcaption.textContent?.trim() || ''
            }
          }

          return ''
        },
        renderHTML: attributes => {
          if (!attributes.caption) return {}
          return {
            'data-caption': attributes.caption,
          }
        },
      },
    }
  },

  // Parse HTML to handle figure elements with figcaption and img tags with data-caption
  parseHTML() {
    return [
      // Parse figure > img with figcaption
      {
        tag: 'figure img[src]',
        getAttrs: (element) => {
          const img = element as HTMLImageElement
          const figure = img.closest('figure')
          const figcaption = figure?.querySelector('figcaption')

          const rawAlt = img.getAttribute('alt') || ''
          const rawCaption = figcaption?.textContent?.trim() || img.getAttribute('data-caption') || ''

          return {
            src: img.getAttribute('src'),
            alt: rawAlt || rawCaption,
            title: img.getAttribute('title'),
            width: img.getAttribute('width') || img.style.width || null,
            height: img.getAttribute('height') || img.style.height || null,
            dataAlign: img.getAttribute('data-align') || 'center',
            caption: rawCaption || rawAlt,
          }
        },
      },
      // Parse img tags with data-caption attribute (higher priority)
      {
        tag: 'img[data-caption]',
        getAttrs: (element) => {
          const img = element as HTMLImageElement
          const rawAlt = img.getAttribute('alt') || ''
          const rawCaption = img.getAttribute('data-caption') || ''

          return {
            src: img.getAttribute('src'),
            alt: rawAlt || rawCaption,
            title: img.getAttribute('title'),
            width: img.getAttribute('width') || img.style.width || null,
            height: img.getAttribute('height') || img.style.height || null,
            dataAlign: img.getAttribute('data-align') || 'center',
            caption: rawCaption || rawAlt,
          }
        },
      },
      // Parse standalone img tags (fallback)
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          const img = element as HTMLImageElement
          const rawAlt = img.getAttribute('alt') || ''
          const rawCaption = img.getAttribute('data-caption') || ''

          return {
            src: img.getAttribute('src'),
            alt: rawAlt || rawCaption,
            title: img.getAttribute('title'),
            width: img.getAttribute('width') || img.style.width || null,
            height: img.getAttribute('height') || img.style.height || null,
            dataAlign: img.getAttribute('data-align') || 'center',
            caption: rawCaption || rawAlt,
          }
        },
      },
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode)
  },
})