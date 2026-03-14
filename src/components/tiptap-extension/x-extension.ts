import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import TwitterView from '../common/tiptap-editor/node-views/TwitterView'

export interface XOptions {
  addPasteHandler: boolean
  theme: 'light' | 'dark'
  HTMLAttributes: Record<string, any>
  inline: boolean
  width: number
  height: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    x: {
      /**
       * Insert an X/Twitter post
       */
      setXVideo: (options: { src: string; width?: number; height?: number }) => ReturnType
    }
  }
}

// Supports both twitter.com and x.com URLs
const X_REGEX = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/
const X_REGEX_GLOBAL = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/g

const isValidXUrl = (url: string) => {
  return url.match(X_REGEX)
}

// Extract tweet ID from X/Twitter URL
const getXTweetId = (url: string): string | null => {
  const match = url.match(X_REGEX)
  return match ? match[5] : null
}

// Extract username from X/Twitter URL
const getXUsername = (url: string): string | null => {
  const match = url.match(X_REGEX)
  return match ? match[4] : null
}

export const X = Node.create<XOptions>({
  name: 'x',

  addOptions() {
    return {
      addPasteHandler: true,
      theme: 'light',
      HTMLAttributes: {},
      inline: false,
      width: 550,
      height: 300,
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
        tag: 'div[data-x-video]',
      },
      {
        tag: 'div[data-twitter-video]',
      },
      {
        tag: 'blockquote.twitter-tweet',
      },
    ]
  },

  addCommands() {
    return {
      setXVideo:
        (options: { src: string; width?: number; height?: number }) =>
        ({ commands }) => {
          if (!isValidXUrl(options.src)) {
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
        find: X_REGEX_GLOBAL,
        type: this.type,
        getAttributes: match => {
          return { src: match.input }
        },
      }),
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const tweetId = getXTweetId(HTMLAttributes.src)
    const username = getXUsername(HTMLAttributes.src)

    if (!tweetId || !username) {
      return [
        'div',
        { 'data-x-video': '', class: 'x-embed-error' },
        'Invalid X/Twitter URL',
      ]
    }

    const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`

    // Return the official Twitter/X blockquote embed format with script
    // This format is required for CMS rendering
    return [
      'div',
      {
        'data-x-video': '',
        class: 'x-embed-wrapper',
        style: `display: flex; justify-content: center; align-items: center; width: 100%; margin: 1.5rem auto;`,
      },
      [
        'blockquote',
        {
          class: 'twitter-tweet',
          'data-theme': this.options.theme,
          'data-width': String(HTMLAttributes.width),
        },
        [
          'a',
          {
            href: tweetUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          'View post on X',
        ],
      ],
      // Twitter/X widgets script - required for CMS rendering
      [
        'script',
        {
          async: 'true',
          src: 'https://platform.twitter.com/widgets.js',
          charset: 'utf-8',
        },
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TwitterView)
  },
})

export default X
