import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import InstagramView from '../node-views/InstagramView';
import TwitterView from '../node-views/TwitterView';

// Declare module augmentation for custom commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    instagramEmbed: {
      setInstagramEmbed: (options: { src: string }) => ReturnType;
    };
    twitterEmbed: {
      setTwitterEmbed: (options: { src: string }) => ReturnType;
    };
    facebookEmbed: {
      setFacebookEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

// Helper function to extract Instagram post ID
export const getInstagramId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const regExp = /(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([^/?#&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// Helper function to extract Twitter/X tweet ID
export const getTwitterId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const regExp = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[2] : null;
};

// Helper function to extract Facebook post/video ID
export const getFacebookEmbedUrl = (url: string): string | null => {
  // Check if it's a Facebook video or post URL
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
  }
  return null;
};

// Determine embed type from URL
export const getEmbedType = (url: string): 'youtube' | 'instagram' | 'twitter' | 'facebook' | null => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  return null;
};

// Instagram Embed Node - Using official blockquote format for CMS compatibility
export const InstagramEmbed = Node.create({
  name: 'instagramEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'instagram-embed-wrapper',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      postId: {
        default: null,
      },
      width: {
        default: 400,
      },
      height: {
        default: 480,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-instagram-embed]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const postId = el.getAttribute('data-post-id');
          if (postId) {
            return { 
              postId,
              src: `https://www.instagram.com/p/${postId}/`
            };
          }
          // Try to get from blockquote
          const blockquote = el.querySelector('blockquote.instagram-media');
          if (blockquote) {
            const permalink = blockquote.getAttribute('data-instgrm-permalink');
            if (permalink) {
              const extractedPostId = getInstagramId(permalink);
              return { 
                postId: extractedPostId,
                src: permalink.split('?')[0]
              };
            }
          }
          return {};
        },
      },
      {
        tag: 'div[data-instagram-video]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const blockquote = el.querySelector('blockquote.instagram-media');
          if (blockquote) {
            const permalink = blockquote.getAttribute('data-instgrm-permalink');
            if (permalink) {
              const extractedPostId = getInstagramId(permalink);
              return { 
                postId: extractedPostId,
                src: permalink.split('?')[0]
              };
            }
          }
          return {};
        },
      },
      {
        tag: 'blockquote.instagram-media',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const permalink = el.getAttribute('data-instgrm-permalink');
          if (permalink) {
            const extractedPostId = getInstagramId(permalink);
            return { 
              postId: extractedPostId,
              src: permalink.split('?')[0]
            };
          }
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const postId = HTMLAttributes.postId || getInstagramId(HTMLAttributes.src) || '';
    // Return empty placeholder if no postId
    if (!postId) {
      return ['div', { 'data-instagram-embed': '', class: 'instagram-embed instagram-embed-error' }, 'Invalid Instagram embed'];
    }
    const postUrl = `https://www.instagram.com/p/${postId}/`;

    // Use official Instagram blockquote embed format for CMS compatibility
    return [
      'div',
      mergeAttributes(
        { 
          'data-instagram-embed': '',
          'data-post-id': postId,
        },
        this.options.HTMLAttributes,
        {
          style: `display: flex; justify-content: center; width: 100%; margin: 1.5rem auto; max-width: ${HTMLAttributes.width}px;`,
        }
      ),
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
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InstagramView);
  },

  addCommands() {
    return {
      setInstagramEmbed:
        (options: { src: string; width?: number; height?: number }) =>
        ({ commands }) => {
          const postId = getInstagramId(options.src);
          if (!postId) return false;
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              postId,
              width: options.width || 400,
              height: options.height || 480,
            },
          });
        },
    };
  },
});

// Helper function to extract Twitter username from URL
export const getTwitterUsername = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const regExp = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// Twitter/X Embed Node - Using official blockquote format for CMS compatibility
export const TwitterEmbed = Node.create({
  name: 'twitterEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      theme: 'light',
      HTMLAttributes: {
        class: 'twitter-embed-wrapper',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      tweetId: {
        default: null,
      },
      username: {
        default: null,
      },
      width: {
        default: 550,
      },
      height: {
        default: 300,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-twitter-embed]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const tweetId = el.getAttribute('data-tweet-id');
          if (tweetId) {
            // Try to get username from the link inside
            const link = el.querySelector('a[href*="twitter.com"]');
            let username = 'user';
            if (link) {
              const href = link.getAttribute('href');
              if (href) {
                const usernameMatch = href.match(/twitter\.com\/(\w+)\/status/);
                if (usernameMatch) {
                  username = usernameMatch[1];
                }
              }
            }
            return { 
              tweetId,
              username,
              src: `https://twitter.com/${username}/status/${tweetId}`
            };
          }
          return {};
        },
      },
      {
        tag: 'div[data-twitter-video]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const blockquote = el.querySelector('blockquote.twitter-tweet');
          if (blockquote) {
            const link = blockquote.querySelector('a[href*="twitter.com"]');
            if (link) {
              const href = link.getAttribute('href');
              if (href) {
                const tweetId = getTwitterId(href);
                const username = getTwitterUsername(href);
                return { 
                  tweetId,
                  username,
                  src: href
                };
              }
            }
          }
          return {};
        },
      },
      {
        tag: 'blockquote.twitter-tweet',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const link = el.querySelector('a[href*="twitter.com"]');
          if (link) {
            const href = link.getAttribute('href');
            if (href) {
              const tweetId = getTwitterId(href);
              const username = getTwitterUsername(href);
              return { 
                tweetId,
                username,
                src: href
              };
            }
          }
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const tweetId = HTMLAttributes.tweetId || getTwitterId(HTMLAttributes.src) || '';
    const username = HTMLAttributes.username || getTwitterUsername(HTMLAttributes.src) || 'user';
    
    // Return empty placeholder if no tweetId
    if (!tweetId) {
      return ['div', { 'data-twitter-embed': '', class: 'twitter-embed twitter-embed-error' }, 'Invalid Twitter embed'];
    }
    
    const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;

    // Use official Twitter blockquote embed format for CMS compatibility
    return [
      'div',
      mergeAttributes(
        { 
          'data-twitter-embed': '',
          'data-tweet-id': tweetId,
        },
        this.options.HTMLAttributes,
        {
          style: `display: flex; justify-content: center; width: 100%; margin: 1.5rem auto; max-width: ${HTMLAttributes.width}px;`,
        }
      ),
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
          'View Tweet on Twitter/X',
        ],
      ],
      // Twitter widgets script - required for CMS rendering
      [
        'script',
        {
          async: 'true',
          src: 'https://platform.twitter.com/widgets.js',
          charset: 'utf-8',
        },
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TwitterView);
  },

  addCommands() {
    return {
      setTwitterEmbed:
        (options: { src: string; width?: number; height?: number }) =>
        ({ commands }) => {
          const tweetId = getTwitterId(options.src);
          const username = getTwitterUsername(options.src);
          if (!tweetId) return false;
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              tweetId,
              username,
              width: options.width || 550,
              height: options.height || 300,
            },
          });
        },
    };
  },
});

// Facebook Embed Node - Similar to YouTube extension
export const FacebookEmbed = Node.create({
  name: 'facebookEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'facebook-embed',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 560,
      },
      height: {
        default: 315,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-facebook-video]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getFacebookEmbedUrl(HTMLAttributes.src);

    return [
      'div',
      mergeAttributes(
        { 'data-facebook-video': '' },
        this.options.HTMLAttributes,
        {
          style: `position: relative; width: 100%; max-width: ${HTMLAttributes.width}px; margin: 1.5rem auto; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); background-color: #f0f2f5; border: 1px solid #dddfe2;`,
        }
      ),
      [
        'iframe',
        {
          src: embedUrl,
          frameborder: '0',
          scrolling: 'no',
          allowtransparency: 'true',
          allowfullscreen: this.options.allowFullscreen ? 'true' : 'false',
          allow: 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share',
          style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setFacebookEmbed:
        (options: { src: string; width?: number; height?: number }) =>
        ({ commands }) => {
          if (!options.src.includes('facebook.com') && !options.src.includes('fb.watch')) {
            return false;
          }
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              width: options.width || 560,
              height: options.height || 315,
            },
          });
        },
    };
  },
});

// Export all embed extensions (YouTube is handled by @tiptap/extension-youtube)
export const EmbedExtensions = [
  InstagramEmbed,
  TwitterEmbed,
  FacebookEmbed,
];
