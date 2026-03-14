/**
 * React BubbleMenu wrapper for tiptap v3
 * In tiptap v3, BubbleMenu was removed from @tiptap/react.
 * This component recreates it using @tiptap/extension-bubble-menu plugin.
 */
import React, { useEffect, useRef, type ReactNode } from 'react'
import type { Editor } from '@tiptap/core'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import type { EditorState } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { PluginKey } from '@tiptap/pm/state'

interface BubbleMenuProps {
  editor: Editor
  children: ReactNode
  className?: string
  tippyOptions?: {
    duration?: number
    placement?: string
    maxWidth?: string | number
    [key: string]: unknown
  }
  shouldShow?: (props: {
    editor: Editor
    element: HTMLElement
    view: EditorView
    state: EditorState
    oldState?: EditorState
    from: number
    to: number
  }) => boolean
  pluginKey?: string
}

let bubbleMenuCounter = 0

export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  editor,
  children,
  className,
  shouldShow,
  pluginKey: pluginKeyProp,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const pluginKeyRef = useRef(
    new PluginKey(pluginKeyProp ?? `bubbleMenu-${bubbleMenuCounter++}`)
  )

  useEffect(() => {
    if (!menuRef.current) return

    const element = menuRef.current
    element.style.visibility = 'hidden'
    element.style.position = 'absolute'

    const plugin = BubbleMenuPlugin({
      pluginKey: pluginKeyRef.current,
      editor,
      element,
      shouldShow: shouldShow ?? null,
    })

    editor.registerPlugin(plugin)

    return () => {
      editor.unregisterPlugin(pluginKeyRef.current)
    }
  }, [editor, shouldShow])

  return (
    <div ref={menuRef} className={className} style={{ zIndex: 100 }}>
      {children}
    </div>
  )
}

export default BubbleMenu
