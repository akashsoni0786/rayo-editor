/**
 * TipTap Extension for Version Comparison
 * Uses htmldiff-js to show differences between document versions
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import HtmlDiff from 'htmldiff-js';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    versionComparison: {
      /**
       * Compare current content with a previous version
       */
      compareVersion: (versionHtml: string) => ReturnType;
      /**
       * Show comparison in separated block view (Old followed by New)
       */
      showBlockDiff: (versionHtml: string) => ReturnType;
      /**
       * Exit comparison mode and restore original content
       */
      exitComparison: () => ReturnType;
      /**
       * Check if currently in comparison mode
       */
      isComparing: () => ReturnType;
    };
  }
}

export interface VersionComparisonOptions {
  onComparisonStart?: () => void;
  onComparisonEnd?: () => void;
}

export interface VersionComparisonStorage {
  isComparing: boolean;
  originalContent: string;
  comparisonContent: string;
  stylePlugin?: Plugin;
}

// Plugin key for style enforcement
const styleEnforcementKey = new PluginKey('diffStyleEnforcement');

/**
 * Create and manage custom tooltip for diff elements
 */
let tooltipElement: HTMLElement | null = null;
let tooltipCleanup: (() => void) | null = null;

function createCustomTooltip(): HTMLElement {
  if (tooltipElement) {
    return tooltipElement;
  }
  
  const tooltip = document.createElement('div');
  tooltip.className = 'diff-custom-tooltip';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);
  tooltipElement = tooltip;
  
  return tooltip;
}

function showTooltip(element: HTMLElement, tooltip: HTMLElement) {
  const tagName = element.tagName.toLowerCase();
  const diffType = element.getAttribute('data-diff');
  
  let tooltipText: string;
  if (tagName === 'del' || diffType === 'deletion') {
    tooltipText = 'Deleted from the current version';
  } else if (tagName === 'ins' || diffType === 'insertion') {
    tooltipText = 'Added in current version';
  } else {
    return;
  }
  
  tooltip.textContent = tooltipText;
  tooltip.className = 'diff-custom-tooltip visible';
  if (diffType === 'deletion') {
    tooltip.classList.add('deletion');
  } else if (diffType === 'insertion') {
    tooltip.classList.add('insertion');
  }

  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  let top = rect.top - tooltipRect.height - 10;

  if (left < 5) left = 5;
  if (left + tooltipRect.width > window.innerWidth - 5) {
    left = window.innerWidth - tooltipRect.width - 5;
  }
  if (top < 5) {
    top = rect.bottom + 10;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.classList.add('below');
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.display = 'block';
}

function hideTooltip(tooltip: HTMLElement) {
  if (tooltip) {
    tooltip.classList.remove('visible');
    tooltip.style.display = 'none';
  }
}

function initializeTooltipListeners(container: HTMLElement) {
  if (tooltipCleanup) {
    tooltipCleanup();
  }

  const tooltip = createCustomTooltip();
  
  const handleMouseEnter = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.matches('ins[data-diff], del[data-diff]')) {
      showTooltip(target, tooltip);
    }
  };

  const handleMouseLeave = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.matches('ins[data-diff], del[data-diff]')) {
      hideTooltip(tooltip);
    }
  };

  container.addEventListener('mouseenter', handleMouseEnter, true);
  container.addEventListener('mouseleave', handleMouseLeave, true);

  tooltipCleanup = () => {
    container.removeEventListener('mouseenter', handleMouseEnter, true);
    container.removeEventListener('mouseleave', handleMouseLeave, true);
    if (tooltipElement) {
      tooltipElement.remove();
      tooltipElement = null;
    }
  };
}

function cleanupTooltipListeners() {
  if (tooltipCleanup) {
    tooltipCleanup();
    tooltipCleanup = null;
  }
}

/**
 * Helper function to pre-process HTML and ensure ins/del tags have inline styles
 */
function preprocessDiffHtml(html: string): string {
  html = html.replace(/<del([^>]*)\s+title="[^"]*"([^>]*)>/gi, '<del$1$2>');
  html = html.replace(/<ins([^>]*)\s+title="[^"]*"([^>]*)>/gi, '<ins$1$2>');
  
  html = html.replace(/<del([^>]*)>/gi, (match, attrs) => {
    const style = `background-color: #FEE2E2 !important; color: #991B1B !important; text-decoration: line-through !important; text-decoration-color: #991B1B !important; padding: 2px 4px !important; border-radius: 3px !important; font-weight: 500 !important; display: inline !important; cursor: text !important;`;
    return `<del${attrs} style="${style}" data-diff="deletion">`;
  });

  html = html.replace(/<ins([^>]*)>/gi, (match, attrs) => {
    const style = `background-color: #DCFCE7 !important; color: #14532D !important; text-decoration: none !important; padding: 2px 4px !important; border-radius: 3px !important; font-weight: 500 !important; display: inline !important; cursor: text !important;`;
    return `<ins${attrs} style="${style}" data-diff="insertion">`;
  });

  return html;
}

/**
 * Inject global CSS rules for comparison view
 */
function injectGlobalStyles() {
  const styleId = 'tiptap-version-comparison-styles';
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* High-Specificity Block Diff Styling */
    .ProseMirror blockquote.diff-block-deletion,
    .ProseMirror blockquote.diff-block-insertion,
    .ProseMirror blockquote.diff-blockquote {
      border-left: none !important;
    }

    .ProseMirror blockquote.diff-block-deletion::before,
    .ProseMirror blockquote.diff-block-insertion::before,
    .ProseMirror blockquote.diff-blockquote::before,
    .ProseMirror blockquote.diff-block-deletion::after,
    .ProseMirror blockquote.diff-block-insertion::after,
    .ProseMirror blockquote.diff-blockquote::after {
      content: none !important;
      display: none !important;
    }

    .ProseMirror blockquote.diff-block-deletion {
      background-color: #FAE8FF !important; /* Magenta bg */
      border: 1px solid #F5D0FE !important;
      border-left: 4px solid #EF4444 !important; /* RED left border */
      border-radius: 8px !important;
      padding: 12px 16px !important;
      margin: 12px 0 !important;
      font-style: normal !important;
      display: block !important;
    }

    .ProseMirror blockquote.diff-block-insertion {
      background-color: #DCFCE7 !important; /* Success green bg */
      border: 1px solid #BBF7D0 !important;
      border-left: 4px solid #22C55E !important; /* GREEN left border */
      border-radius: 8px !important;
      padding: 12px 16px !important;
      margin: 4px 0 16px 0 !important;
      font-style: normal !important;
      display: block !important;
    }
    
    /* Ensure solid background by removing child spacing */
    .ProseMirror blockquote.diff-block-deletion *,
    .ProseMirror blockquote.diff-block-insertion * {
      margin-top: 0 !important;
      margin-bottom: 4px !important;
      background-color: transparent !important;
      color: inherit !important;
    }

    .ProseMirror blockquote.diff-block-deletion *:last-child,
    .ProseMirror blockquote.diff-block-insertion *:last-child {
      margin-bottom: 0 !important;
    }

    /* Standard inline diff highlights */
    del[data-diff="deletion"] { background-color: #FEE2E2 !important; color: #991B1B !important; text-decoration: line-through !important; text-decoration-color: #991B1B !important; cursor: text !important; }
    ins[data-diff="insertion"] { background-color: #DCFCE7 !important; color: #14532D !important; text-decoration: none !important; cursor: text !important; }

    /* Ensure del inside ins keeps red background, not green */
    ins del, ins del[data-diff="deletion"] { background-color: #FEE2E2 !important; color: #991B1B !important; text-decoration: line-through !important; text-decoration-color: #991B1B !important; }

    .diff-split-wrapper { display: block !important; margin: 24px 0 !important; clear: both !important; }
    ins::after, del::after { content: none !important; display: none !important; }
  `;

  document.head.appendChild(style);
}

export const VersionComparisonExtension = Extension.create<
  VersionComparisonOptions,
  VersionComparisonStorage
>({
  name: 'versionComparison',

  addStorage() {
    return {
      isComparing: false,
      originalContent: '',
      comparisonContent: '',
      stylePlugin: undefined,
    };
  },

  onCreate() {
    injectGlobalStyles();
  },

  addCommands() {
    return {
      showBlockDiff:
        (versionHtml: string) =>
        ({ editor, commands }) => {
          console.log('📝 [VersionComparison] Executing showBlockDiff');
          
          if (!this.storage.isComparing) {
            this.storage.originalContent = editor.getHTML();
          }

          try {
            let diffHtml: string;
            if (typeof HtmlDiff === 'function' && HtmlDiff.execute) {
              diffHtml = HtmlDiff.execute(versionHtml, this.storage.originalContent);
            } else {
              diffHtml = (HtmlDiff as any).default.execute(versionHtml, this.storage.originalContent);
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(diffHtml, 'text/html');
            const body = doc.body;

            const topLevelBlocks = Array.from(body.children) as HTMLElement[];
            const blocksWithChanges = topLevelBlocks.filter(block => 
               block.querySelector('ins') || block.querySelector('del')
            );
            
            if (blocksWithChanges.length === 0) return false;

            // Group adjacent changes
            const groupedBlocks: HTMLElement[][] = [];
            let currentGroup: HTMLElement[] = [];
            
            for (let i = 0; i < blocksWithChanges.length; i++) {
              const currentBlock = blocksWithChanges[i];
              if (currentGroup.length === 0) {
                currentGroup.push(currentBlock);
                continue;
              }
              const prevBlock = currentGroup[currentGroup.length - 1];
              const prevIndex = topLevelBlocks.indexOf(prevBlock);
              const currIndex = topLevelBlocks.indexOf(currentBlock);
              
              if (currIndex === prevIndex + 1 || !topLevelBlocks.slice(prevIndex + 1, currIndex).some(b => b.textContent?.trim())) {
                currentGroup.push(currentBlock);
              } else {
                groupedBlocks.push([...currentGroup]);
                currentGroup = [currentBlock];
              }
            }
            if (currentGroup.length > 0) groupedBlocks.push(currentGroup);

            // Transform groups to split view
            groupedBlocks.forEach(group => {
               const firstBlock = group[0];
               
               const oldBq = doc.createElement('blockquote');
               oldBq.className = 'diff-block-deletion';
               // Force inline styles for background and borders
               oldBq.setAttribute('style', 'background-color: #FAE8FF !important; border: 1px solid #F5D0FE !important; border-left: 4px solid #EF4444 !important; border-radius: 8px !important; padding: 12px 16px !important; margin: 12px 0 !important; font-style: normal !important; display: block !important;');
               
               group.forEach(block => {
                  const oldBlock = block.cloneNode(true) as HTMLElement;
                  oldBlock.querySelectorAll('ins').forEach(el => el.remove());
                  oldBlock.querySelectorAll('del').forEach(el => {
                    const parent = el.parentNode;
                    if (parent) {
                      while (el.firstChild) parent.insertBefore(el.firstChild, el);
                      parent.removeChild(el);
                    }
                  });
                  oldBlock.setAttribute('style', 'margin: 0 !important; background-color: transparent !important;');
                  oldBq.appendChild(oldBlock);
               });
               
               const newBq = doc.createElement('blockquote');
               newBq.className = 'diff-block-insertion';
               newBq.setAttribute('style', 'background-color: #DCFCE7 !important; border: 1px solid #BBF7D0 !important; border-left: 4px solid #22C55E !important; border-radius: 8px !important; padding: 12px 16px !important; margin: 4px 0 16px 0 !important; font-style: normal !important; display: block !important;');
               
               group.forEach(block => {
                  const newBlock = block.cloneNode(true) as HTMLElement;
                  newBlock.querySelectorAll('del').forEach(el => el.remove());
                  newBlock.querySelectorAll('ins').forEach(el => {
                    const parent = el.parentNode;
                    if (parent) {
                      while (el.firstChild) parent.insertBefore(el.firstChild, el);
                      parent.removeChild(el);
                    }
                  });
                  newBlock.setAttribute('style', 'margin: 0 !important; background-color: transparent !important;');
                  newBq.appendChild(newBlock);
               });
               
               const wrapper = doc.createElement('div');
               wrapper.className = 'diff-split-wrapper';
               wrapper.appendChild(oldBq);
               wrapper.appendChild(newBq);
               
               if (firstBlock.parentNode) {
                  firstBlock.parentNode.replaceChild(wrapper, firstBlock);
                  for (let i = 1; i < group.length; i++) {
                     if (group[i].parentNode) group[i].parentNode?.removeChild(group[i]);
                  }
               }
            });
            
            const finalHtml = body.innerHTML;
            this.storage.comparisonContent = finalHtml;
            this.storage.isComparing = true;
            commands.setContent(finalHtml);
            editor.setEditable(false);
            
            if (editor.view.dom) {
              editor.view.dom.classList.add('comparison-mode-active');
              initializeTooltipListeners(editor.view.dom);
            }

            if (this.options.onComparisonStart) this.options.onComparisonStart();
            return true;
          } catch (error) {
            console.error('❌ [VersionComparison] Error during block comparison:', error);
            return false;
          }
        },

      compareVersion:
        (versionHtml: string) =>
        ({ editor, commands }) => {
          if (!this.storage.isComparing) {
            this.storage.originalContent = editor.getHTML();
          }

          try {
            let diffHtml: string;
            if (typeof HtmlDiff === 'function' && HtmlDiff.execute) {
              diffHtml = HtmlDiff.execute(versionHtml, this.storage.originalContent);
            } else {
              diffHtml = (HtmlDiff as any).default.execute(versionHtml, this.storage.originalContent);
            }

            diffHtml = preprocessDiffHtml(diffHtml);
            this.storage.comparisonContent = diffHtml;
            this.storage.isComparing = true;
            commands.setContent(diffHtml);
            editor.setEditable(false);

            if (editor.view.dom) {
              editor.view.dom.classList.add('comparison-mode-active');
              initializeTooltipListeners(editor.view.dom);
            }

            if (this.options.onComparisonStart) this.options.onComparisonStart();
            return true;
          } catch (error) {
            console.error('❌ [VersionComparison] Error during comparison:', error);
            return false;
          }
        },

      exitComparison:
        () =>
        ({ editor, commands }) => {
          if (!this.storage.isComparing) return false;

          commands.setContent(this.storage.originalContent);
          editor.setEditable(true);

          if (editor.view.dom) {
            editor.view.dom.classList.remove('comparison-mode-active');
          }

          cleanupTooltipListeners();
          // Remove injected global comparison styles
          const styleElement = document.getElementById('tiptap-version-comparison-styles');
          if (styleElement) styleElement.remove();
          this.storage.isComparing = false;
          this.storage.comparisonContent = '';

          if (this.options.onComparisonEnd) this.options.onComparisonEnd();
          return true;
        },

      isComparing:
        () =>
        () => {
          return this.storage.isComparing;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Escape': () => {
        if (this.storage.isComparing) {
          return this.editor.commands.exitComparison();
        }
        return false;
      },
    };
  },

  onDestroy() {
    const styleElement = document.getElementById('tiptap-version-comparison-styles');
    if (styleElement) styleElement.remove();
  },
});

/**
 * Helper function to get diff statistics from HTML
 */
export function getDiffStats(diffHtml: string): {
  additions: number;
  deletions: number;
  hasChanges: boolean;
} {
  const insertions = (diffHtml.match(/<ins[^>]*>/g) || []).length;
  const deletions = (diffHtml.match(/<del[^>]*>/g) || []).length;

  return {
    additions: insertions,
    deletions: deletions,
    hasChanges: insertions > 0 || deletions > 0,
  };
}
