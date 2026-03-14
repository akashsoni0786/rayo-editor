import { Node, Mark, mergeAttributes } from '@tiptap/core';

// Mark for inserted content (additions in diff)
// Using Mark with spanning disabled to work within blocks
export const DiffInsertion = Mark.create({
  name: 'diffInsertion',

  spanning: false, // Don't span across nodes
  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'ins',
        priority: 100, // High priority to match first
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          // Capture all attributes
          return {
            class: element.getAttribute('class'),
            style: element.getAttribute('style'),
            'data-diff': element.getAttribute('data-diff') || 'insertion',
          };
        },
      },
    ];
  },

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes) => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
      'data-diff': {
        default: 'insertion',
        parseHTML: (element) => element.getAttribute('data-diff'),
        renderHTML: (attributes) => {
          return { 'data-diff': attributes['data-diff'] || 'insertion' };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'ins',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setDiffInsertion:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.setMark(this.name);
        },
      unsetDiffInsertion:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.unsetMark(this.name);
        },
    } as any;
  },
});

// Mark for deleted content (deletions in diff)
// Using Mark with spanning disabled to work within blocks
export const DiffDeletion = Mark.create({
  name: 'diffDeletion',

  spanning: false, // Don't span across nodes
  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'del',
        priority: 100, // High priority to match first
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          return {
            class: element.getAttribute('class'),
            style: element.getAttribute('style'),
            'data-diff': element.getAttribute('data-diff') || 'deletion',
          };
        },
      },
    ];
  },

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes) => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
      'data-diff': {
        default: 'deletion',
        parseHTML: (element) => element.getAttribute('data-diff'),
        renderHTML: (attributes) => {
          return { 'data-diff': attributes['data-diff'] || 'deletion' };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'del',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setDiffDeletion:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.setMark(this.name);
        },
      unsetDiffDeletion:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.unsetMark(this.name);
        },
    } as any;
  },
});
