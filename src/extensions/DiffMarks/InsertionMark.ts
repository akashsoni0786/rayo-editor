/**
 * TipTap Mark Extension for <ins> tag (insertions in diff)
 */

import { Mark, mergeAttributes } from '@tiptap/core';

export interface InsertionMarkOptions {
  HTMLAttributes: Record<string, any>;
}

export const InsertionMark = Mark.create<InsertionMarkOptions>({
  name: 'insertion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'ins',
        getAttrs: (node) => {
          // Preserve all attributes from the ins tag
          return {};
        },
      },
      {
        tag: 'ins.diffins',
      },
      {
        tag: 'ins[data-diff="insertion"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'ins',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'diffins',
        'data-diff': 'insertion',
      }),
      0,
    ];
  },

  addAttributes() {
    return {
      class: {
        default: 'diffins',
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
        default: 'insertion',
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
