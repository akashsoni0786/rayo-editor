/**
 * Spacing Normalization Extension
 *
 * Provides automatic and manual spacing normalization:
 * - Remove extra line breaks
 * - Clean empty paragraphs
 * - Normalize whitespace
 * - Content cleanup on paste
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { SpacingOptions } from '../types'
import {
  cleanupHtmlSpacing,
  normalizeWhitespace,
  removeExtraLineBreaks,
  cleanupEmptyParagraphs,
} from '../utils/spacing-utils'

export interface SpacingNormalizationOptions extends SpacingOptions {
  /** Auto-cleanup on paste */
  cleanupOnPaste?: boolean
  /** Auto-cleanup on input */
  cleanupOnInput?: boolean
  /** Maximum consecutive empty lines */
  maxConsecutiveEmptyLines?: number
}

const spacingPluginKey = new PluginKey('spacingNormalization')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spacingNormalization: {
      /**
       * Normalize all spacing in the document
       */
      normalizeSpacing: () => ReturnType
      /**
       * Remove all empty paragraphs
       */
      removeEmptyParagraphs: () => ReturnType
      /**
       * Remove extra line breaks (more than max allowed)
       */
      removeExtraLineBreaks: () => ReturnType
      /**
       * Clean up the entire document
       */
      cleanupDocument: () => ReturnType
    }
  }
}

export const SpacingNormalizationExtension = Extension.create<SpacingNormalizationOptions>({
  name: 'spacingNormalization',

  addOptions() {
    return {
      removeExtraLineBreaks: true,
      removeEmptyParagraphs: true,
      normalizeWhitespace: true,
      trimContent: true,
      cleanupOnPaste: true,
      cleanupOnInput: false,
      maxConsecutiveEmptyLines: 2,
    }
  },

  addCommands() {
    return {
      normalizeSpacing:
        () =>
        ({ editor, tr, dispatch }) => {
          if (!dispatch) return false

          const { doc } = tr
          let modified = false

          doc.descendants((node, pos) => {
            if (node.isText && node.text) {
              const normalized = normalizeWhitespace(node.text)
              if (normalized !== node.text) {
                tr.replaceWith(pos, pos + node.nodeSize, editor.schema.text(normalized))
                modified = true
              }
            }
            return true
          })

          return modified
        },

      removeEmptyParagraphs:
        () =>
        ({ tr, dispatch }) => {
          if (!dispatch) return false

          const nodesToRemove: { from: number; to: number }[] = []

          tr.doc.descendants((node, pos) => {
            if (node.type.name === 'paragraph' && node.content.size === 0) {
              nodesToRemove.push({
                from: pos,
                to: pos + node.nodeSize,
              })
            }
            return true
          })

          // Remove in reverse order to maintain positions
          nodesToRemove.reverse().forEach(({ from, to }) => {
            tr.delete(from, to)
          })

          return nodesToRemove.length > 0
        },

      removeExtraLineBreaks:
        () =>
        ({ editor, tr, dispatch }) => {
          if (!dispatch) return false

          const { doc } = tr
          let modified = false
          const maxEmpty = this.options.maxConsecutiveEmptyLines || 2

          // Track consecutive empty paragraphs
          const emptyParagraphRuns: { start: number; end: number; count: number }[] = []
          let currentRun: { start: number; end: number; count: number } | null = null

          doc.descendants((node, pos) => {
            if (node.type.name === 'paragraph') {
              if (node.content.size === 0) {
                if (!currentRun) {
                  currentRun = { start: pos, end: pos + node.nodeSize, count: 1 }
                } else {
                  currentRun.end = pos + node.nodeSize
                  currentRun.count++
                }
              } else {
                if (currentRun && currentRun.count > maxEmpty) {
                  emptyParagraphRuns.push(currentRun)
                }
                currentRun = null
              }
            }
            return true
          })

          // Handle final run
          if (currentRun && currentRun.count > maxEmpty) {
            emptyParagraphRuns.push(currentRun)
          }

          // Remove extra empty paragraphs, keeping maxEmpty
          emptyParagraphRuns.reverse().forEach((run) => {
            const keepCount = maxEmpty
            const removeCount = run.count - keepCount
            if (removeCount > 0) {
              const emptyParagraph = editor.schema.nodes.paragraph?.create()
              if (emptyParagraph) {
                // Calculate size of paragraphs to remove
                const singleParagraphSize = emptyParagraph.nodeSize
                const removeEnd = run.end
                const removeStart = run.end - removeCount * singleParagraphSize
                tr.delete(removeStart, removeEnd)
                modified = true
              }
            }
          })

          return modified
        },

      cleanupDocument:
        () =>
        ({ commands }) => {
          let success = true

          if (this.options.normalizeWhitespace) {
            success = commands.normalizeSpacing() && success
          }

          if (this.options.removeExtraLineBreaks) {
            success = commands.removeExtraLineBreaks() && success
          }

          if (this.options.removeEmptyParagraphs) {
            // Don't remove all empty paragraphs, just excessive ones
            // This is handled by removeExtraLineBreaks
          }

          return success
        },
    }
  },

  addProseMirrorPlugins() {
    const options = this.options

    return [
      new Plugin({
        key: spacingPluginKey,

        props: {
          // Handle paste events for cleanup
          handlePaste(view, event, slice) {
            if (!options.cleanupOnPaste) return false

            // Get HTML from clipboard
            const html = event.clipboardData?.getData('text/html')
            if (!html) return false

            // Clean up the HTML
            const cleanedHtml = cleanupHtmlSpacing(html, {
              removeExtraLineBreaks: options.removeExtraLineBreaks,
              normalizeWhitespace: options.normalizeWhitespace,
              removeEmptyParagraphs: options.removeEmptyParagraphs,
            })

            // If HTML was modified, let the editor handle the cleaned version
            if (cleanedHtml !== html) {
              // Create a new data transfer with cleaned HTML
              const dt = new DataTransfer()
              dt.setData('text/html', cleanedHtml)
              dt.setData('text/plain', event.clipboardData?.getData('text/plain') || '')

              // Create new clipboard event with cleaned data
              const newEvent = new ClipboardEvent('paste', {
                clipboardData: dt,
                bubbles: true,
                cancelable: true,
              })

              // Dispatch the new event
              view.dom.dispatchEvent(newEvent)
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})

export default SpacingNormalizationExtension
