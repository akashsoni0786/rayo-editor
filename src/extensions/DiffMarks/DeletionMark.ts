/**
 * TipTap Mark Extension for <del> tag (deletions in diff)
 */

import { Mark, mergeAttributes } from '@tiptap/core';

export interface DeletionMarkOptions {
  HTMLAttributes: Record<string, any>;
}

export const DeletionMark = Mark.create<DeletionMarkOptions>({
  name: 'deletion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'del',
        getAttrs: (node) => {
          // Preserve all attributes from the del tag
          return {};
        },
      },
      {
        tag: 'del.diffdel',
      },
      {
        tag: 'del[data-diff="deletion"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'del',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'diffdel',
        'data-diff': 'deletion',
      }),
      0,
    ];
  },

  addAttributes() {
    return {
      class: {
        default: 'diffdel',
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes) => {
          return {
            class: attributes.class,
          };
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return {
            style: attributes.style,
          };
        },
      },
      'data-diff': {
        default: 'deletion',
        parseHTML: (element) => element.getAttribute('data-diff'),
        renderHTML: (attributes) => {
          return {
            'data-diff': attributes['data-diff'],
          };
        },
      },
    };
  },
});
