import * as React from "react"
import { type Editor } from "@tiptap/react"
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Trash2
} from "lucide-react"

// --- UI Primitives ---
import { Button } from "../../tiptap-ui-primitive/button"
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "../../tiptap-ui-primitive/toolbar"

interface TableBubbleProps {
  editor: Editor
}

export function TableBubble({ editor }: TableBubbleProps) {
  if (!editor.isActive('table')) {
    return null
  }

  // Hide bubble menu when table is in AI review mode (pendingDelete or pendingInsert)
  // During replacement: Red table = no controls, Green table = no controls (use global Accept/Reject)
  const { selection } = editor.state
  const { $from } = selection

  // Find the table node at current position
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d)
    if (node.type.name === 'table') {
      console.log('[TableBubble] Found table node, attrs:', {
        pendingDelete: node.attrs.pendingDelete,
        pendingInsert: node.attrs.pendingInsert,
        allAttrs: node.attrs
      })
      // If table has pending attributes, hide the bubble menu
      if (node.attrs.pendingDelete || node.attrs.pendingInsert) {
        console.log('[TableBubble] Hiding bubble - table has pending attribute')
        return null
      }
      break
    }
  }

  console.log('[TableBubble] Showing bubble menu (no pending attributes)')
  return (
    <Toolbar variant="floating">
      {/* Column Actions */}
      <ToolbarGroup>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.can().addColumnBefore()}
          tooltip="Insert Column Before"
        >
          <BetweenHorizontalEnd className="tiptap-button-icon" size={16} />
        </Button>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
          tooltip="Insert Column After"
        >
          <BetweenHorizontalStart className="tiptap-button-icon" size={16} />
        </Button>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
          tooltip="Delete Column"
        >
          <svg className="tiptap-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z"/>
            <path d="M9 3v18"/>
            <path d="M15 3v18"/>
            <path d="M12 8l3 3-3 3"/>
            <path d="M12 16l-3-3 3-3"/>
          </svg>
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Row Actions */}
      <ToolbarGroup>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.can().addRowBefore()}
          tooltip="Insert Row Above"
        >
          <BetweenVerticalEnd className="tiptap-button-icon" size={16} />
        </Button>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
          tooltip="Insert Row Below"
        >
          <BetweenVerticalStart className="tiptap-button-icon" size={16} />
        </Button>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          tooltip="Delete Row"
        >
          <svg className="tiptap-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z"/>
            <path d="M3 9h18"/>
            <path d="M3 15h18"/>
            <path d="M8 12l3-3 3 3"/>
            <path d="M16 12l-3 3-3-3"/>
          </svg>
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Cell Actions */}
      <ToolbarGroup>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().mergeCells().run()}
          disabled={!editor.can().mergeCells()}
          tooltip="Merge Cells"
        >
          <svg className="tiptap-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M12 8v8"/>
            <path d="M8 12h8"/>
          </svg>
        </Button>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().splitCell().run()}
          disabled={!editor.can().splitCell()}
          tooltip="Split Cell"
        >
          <svg className="tiptap-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M12 3v18"/>
            <path d="M3 12h8"/>
            <path d="M13 12h8"/>
          </svg>
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Delete Table */}
      <ToolbarGroup>
        <Button
          data-style="ghost"
          data-size="sm"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
          tooltip="Delete Table"
        >
          <Trash2 className="tiptap-button-icon" size={16} />
        </Button>
      </ToolbarGroup>
    </Toolbar>
  )
}