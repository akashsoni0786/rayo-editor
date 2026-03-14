import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import InstagramView from '../common/tiptap-editor/node-views/InstagramView'

export interface InstagramOptions {
  addPasteHandler: boolean
  allowFullscreen: boolean
  HTMLAttributes: Record<string, any>
  inline: boolean
  width: number
  height: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    instagram: {
      /**
       * Insert an Instagram post
       */
      setInstagramVideo: (options: { src: string; width?: number; height?: number }) => ReturnType
    }
  }
}

const INSTAGRAM_REGEX = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)\/?/
const INSTAGRAM_REGEX_GLOBAL = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)\/?/g

const isValidInstagramUrl = (url: string) => {
  return url.match(INSTAGRAM_REGEX)
}

// Extract post ID from Instagram URL
const getInstagramPostId = (url: string): string | null => {
  const match = url.match(INSTAGRAM_REGEX)
  return match ? match[4] : null
}

// Get embed URL for Instagram
const getEmbedUrlFromInstagramUrl = (url: string): string | null => {
  const postId = getInstagramPostId(url)
  if (!postId) return null
  return `https://www.instagram.com/p/${postId}/embed/`
}

export const Instagram = Node.create<InstagramOptions>({
  name: 'instagram',

  addOptions() {
    return {
      addPasteHandler: true,
      allowFullscreen: true,
      HTMLAttributes: {},
      inline: false,
      width: 400,
      height: 480,
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,
  
  atom: true,
  
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
    }
  },

  parseHTML() {
    return [
      {
        // Match the saved HTML format: div[data-instagram-embed][data-post-id]
        tag: 'div[data-instagram-embed]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const postId = el.getAttribute('data-post-id');
          if (postId) {
            return { src: `https://www.instagram.com/p/${postId}/` };
          }
          // Fallback: try to get from blockquote
          const blockquote = el.querySelector('blockquote.instagram-media');
          if (blockquote) {
            const permalink = blockquote.getAttribute('data-instgrm-permalink');
            if (permalink) {
              return { src: permalink.split('?')[0] };
            }
          }
          return false;
        },
      },
      {
        tag: 'div[data-instagram-video]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          // Try to get from blockquote first
          const blockquote = el.querySelector('blockquote.instagram-media');
          if (blockquote) {
            const permalink = blockquote.getAttribute('data-instgrm-permalink');
            if (permalink) {
              return { src: permalink.split('?')[0] };
            }
          }
          // Try iframe
          const iframe = el.querySelector('iframe');
          if (iframe) {
            const src = iframe.getAttribute('src');
            if (src) {
              // Extract post URL from embed URL
              const match = src.match(/instagram\.com\/p\/([^/]+)/);
              if (match) {
                return { src: `https://www.instagram.com/p/${match[1]}/` };
              }
              return { src };
            }
          }
          return false;
        },
      },
      {
        tag: 'blockquote.instagram-media',
        getAttrs: (element) => {
          const permalink = (element as HTMLElement).getAttribute('data-instgrm-permalink')
          return permalink ? { src: permalink.split('?')[0] } : false
        },
      },
    ]
  },

  addCommands() {
    return {
      setInstagramVideo:
        (options: { src: string; width?: number; height?: number }) =>
        ({ commands }) => {
          if (!isValidInstagramUrl(options.src)) {
            return false
          }

          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return []
    }

    return [
      nodePasteRule({
        find: INSTAGRAM_REGEX_GLOBAL,
        type: this.type,
        getAttributes: match => {
          return { src: match.input }
        },
      }),
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedUrlFromInstagramUrl(HTMLAttributes.src)
    const postId = getInstagramPostId(HTMLAttributes.src)
    const postUrl = `https://www.instagram.com/p/${postId}/`

    if (!embedUrl || !postId) {
      return [
        'div',
        { 'data-instagram-video': '', class: 'instagram-embed-error' },
        'Invalid Instagram URL',
      ]
    }

    // Return the official Instagram blockquote embed format with script
    // This format is required for CMS rendering
    return [
      'div',
      {
        'data-instagram-video': '',
        class: 'instagram-embed-wrapper',
        style: `display: flex; justify-content: center; align-items: center; width: 100%; margin: 1.5rem auto;`,
      },
      [
        'blockquote',
        {
          class: 'instagram-media',
          'data-instgrm-permalink': `${postUrl}?utm_source=ig_embed`,
          'data-instgrm-version': '14',
          style: `background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 0; max-width:${HTMLAttributes.width}px; min-width:326px; padding:0; width:calc(100% - 2px);`,
        },
        [
          'div',
          { style: 'padding:16px;' },
          [
            'a',
            {
              href: postUrl,
              style: 'background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            'View this post on Instagram',
          ],
        ],
      ],
      // Instagram embed script - required for CMS rendering
      [
        'script',
        {
          async: 'true',
          src: '//www.instagram.com/embed.js',
        },
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InstagramView)
  },
})

export default Instagram
