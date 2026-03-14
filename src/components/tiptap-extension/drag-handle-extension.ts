import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface DragHandleOptions {
  /**
   * The class name to apply to the drag handle element
   */
  dragHandleClass: string
  /**
   * The class name to apply when the node is being dragged
   */
  draggingClass: string
}

export const DragHandlePluginKey = new PluginKey('dragHandle')

export const DragHandleExtension = Extension.create<DragHandleOptions>({
  name: 'dragHandle',

  addOptions() {
    return {
      dragHandleClass: 'drag-handle',
      draggingClass: 'is-dragging',
    }
  },

  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin({
        key: DragHandlePluginKey,
        props: {
          handleDOMEvents: {
            // Enable native drag-drop for block nodes
            dragstart: (view, event) => {
              const target = event.target as HTMLElement

              // Check if drag started from a drag handle
              if (!target.classList.contains('drag-handle-icon')) {
                return false
              }

              const nodeWrapper = target.closest('[data-drag-handle]')
              if (!nodeWrapper) return false

              const pos = view.posAtDOM(nodeWrapper, 0)
              if (pos < 0) return false

              // Get the node at this position
              const $pos = view.state.doc.resolve(pos)
              const node = $pos.nodeAfter

              if (!node) return false

              // Create a selection for the node
              view.dispatch(
                view.state.tr.setSelection(
                  (editor.state.selection.constructor as any).near($pos)
                )
              )

              // Set drag data
              if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/html', node.type.name)
              }

              return false
            },
          },
        },
      }),
    ]
  },
})

export default DragHandleExtension
