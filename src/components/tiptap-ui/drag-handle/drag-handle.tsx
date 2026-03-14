import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { GripVertical, Plus, Trash2, Copy, Clipboard } from 'lucide-react'
import { NodeSelection } from '@tiptap/pm/state'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../tiptap-ui-primitive/dropdown-menu'
import './drag-handle.scss'

interface DragHandleProps {
  editor: Editor | null
}

interface NodeInfo {
  pos: number
  node: any
  dom: HTMLElement
}

export const DragHandle: React.FC<DragHandleProps> = ({ editor }) => {
  const [currentNode, setCurrentNode] = useState<NodeInfo | null>(null)
  const [handlePosition, setHandlePosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get block-level node at position
  const getBlockNode = useCallback((pos: number) => {
    if (!editor) return null

    const $pos = editor.state.doc.resolve(pos)

    // Walk up to find the block-level parent
    for (let depth = $pos.depth; depth >= 0; depth--) {
      const node = $pos.node(depth)
      const nodeStart = $pos.start(depth)

      // Skip the doc node
      if (node.type.name === 'doc') continue

      // Check if it's a block-level node
      if (node.isBlock) {
        return {
          pos: nodeStart - 1,
          node,
          depth,
        }
      }
    }

    return null
  }, [editor])

  // Handle mouse move to show drag handle
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!editor || !editor.isEditable || menuOpen || isDragging) return

    const editorElement = editor.view.dom
    const editorRect = editorElement.getBoundingClientRect()

    // Check if mouse is within editor bounds
    if (
      event.clientX < editorRect.left ||
      event.clientX > editorRect.right ||
      event.clientY < editorRect.top ||
      event.clientY > editorRect.bottom
    ) {
      // Don't hide immediately if we're near the drag handle
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      hideTimeoutRef.current = setTimeout(() => {
        if (!menuOpen) {
          setIsVisible(false)
        }
      }, 200)
      return
    }

    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    // Get position from mouse coordinates
    const pos = editor.view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    })

    if (!pos) {
      return
    }

    // Get the block node at this position
    const blockInfo = getBlockNode(pos.pos)

    if (!blockInfo) {
      return
    }

    // Get DOM element for this node
    const dom = editor.view.nodeDOM(blockInfo.pos) as HTMLElement

    if (!dom) {
      return
    }

    // Calculate handle position
    const domRect = dom.getBoundingClientRect()
    const containerRect = editorElement.parentElement?.getBoundingClientRect() || editorRect

    setHandlePosition({
      top: domRect.top - containerRect.top,
      left: -32, // Position to the left of the content
    })

    setCurrentNode({
      pos: blockInfo.pos,
      node: blockInfo.node,
      dom,
    })
    setIsVisible(true)
  }, [editor, getBlockNode, menuOpen, isDragging])

  // Set up mouse move listener
  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom.closest('.simple-editor-content')?.parentElement

    if (!editorElement) return

    editorElement.addEventListener('mousemove', handleMouseMove)

    return () => {
      editorElement.removeEventListener('mousemove', handleMouseMove)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [editor, handleMouseMove])

  // Handle node deletion
  const handleDelete = useCallback(() => {
    if (!editor || !currentNode) return

    editor
      .chain()
      .focus()
      .setNodeSelection(currentNode.pos)
      .deleteSelection()
      .run()

    setMenuOpen(false)
    setIsVisible(false)
  }, [editor, currentNode])

  // Handle node duplication
  const handleDuplicate = useCallback(() => {
    if (!editor || !currentNode) return

    const { node, pos } = currentNode
    const insertPos = pos + node.nodeSize

    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, node.toJSON())
      .run()

    setMenuOpen(false)
  }, [editor, currentNode])

  // Handle copy to clipboard
  const handleCopy = useCallback(() => {
    if (!editor || !currentNode) return

    editor.chain().focus().setNodeSelection(currentNode.pos).run()
    document.execCommand('copy')
    setMenuOpen(false)
  }, [editor, currentNode])

  // Handle adding new paragraph below
  const handleAddBelow = useCallback(() => {
    if (!editor || !currentNode) return

    const { node, pos } = currentNode
    const insertPos = pos + node.nodeSize

    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, { type: 'paragraph' })
      .setTextSelection(insertPos + 1)
      .run()

    setMenuOpen(false)
    setIsVisible(false)
  }, [editor, currentNode])

  // Handle drag start
  const handleDragStart = useCallback((event: React.DragEvent) => {
    if (!editor || !currentNode) return

    setIsDragging(true)

    // Select the node
    editor.chain().focus().setNodeSelection(currentNode.pos).run()

    // Set drag data
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', currentNode.node.type.name)

    // Create a drag image
    const dragImage = currentNode.dom.cloneNode(true) as HTMLElement
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    dragImage.style.opacity = '0.8'
    dragImage.style.transform = 'scale(0.9)'
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 0, 0)

    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
  }, [editor, currentNode])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle drop
  useEffect(() => {
    if (!editor) return

    const handleDrop = (event: DragEvent) => {
      if (!isDragging || !currentNode) return

      event.preventDefault()

      const dropPos = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      })

      if (!dropPos) return

      const { pos, node } = currentNode

      // Don't do anything if dropped at same position
      if (Math.abs(dropPos.pos - pos) < 2) return

      // Determine insert position
      const $dropPos = editor.state.doc.resolve(dropPos.pos)
      let insertPos = $dropPos.before($dropPos.depth) || dropPos.pos

      // Adjust if we're moving down
      if (insertPos > pos) {
        insertPos = insertPos - node.nodeSize
      }

      // Perform the move
      editor
        .chain()
        .focus()
        .setNodeSelection(pos)
        .deleteSelection()
        .insertContentAt(Math.max(0, insertPos), node.toJSON())
        .run()

      setIsDragging(false)
      setIsVisible(false)
    }

    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('drop', handleDrop)
    }
  }, [editor, isDragging, currentNode])

  if (!editor || !editor.isEditable || !isVisible) {
    return null
  }

  return (
    <div
      ref={dragHandleRef}
      className={`drag-handle-container ${isDragging ? 'is-dragging' : ''}`}
      style={{
        top: handlePosition.top,
        left: handlePosition.left,
      }}
      onMouseEnter={() => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current)
          hideTimeoutRef.current = null
        }
      }}
    >
      {/* Add button */}
      <button
        className="drag-handle-btn drag-handle-add"
        onClick={handleAddBelow}
        title="Add block below"
      >
        <Plus size={14} />
      </button>

      {/* Drag handle with dropdown menu */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="drag-handle-btn drag-handle-grip"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            title="Drag to move / Click for options"
          >
            <GripVertical size={14} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={4}>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 size={14} />
            <span>Delete</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy size={14} />
            <span>Duplicate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Clipboard size={14} />
            <span>Copy to clipboard</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default DragHandle
