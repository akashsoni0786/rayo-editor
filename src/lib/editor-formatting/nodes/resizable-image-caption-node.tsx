/**
 * Resizable Image with Caption Node Component
 *
 * A React component for TipTap that provides:
 * - Interactive image resizing with drag handles
 * - Caption editing with placement options
 * - Alignment controls (left, center, right)
 * - Delete functionality
 * - Diff visualization (pending delete/insert states)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { AlignLeft, AlignCenter, AlignRight, Trash2, Type } from 'lucide-react'
import type { ImageAlignment } from '../types'

import './resizable-image-caption-node.scss'

export const ResizableImageWithCaption: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, deleteNode, selected, editor } = props

  // State
  const [isResizing, setIsResizing] = useState(false)
  const [isEditingCaption, setIsEditingCaption] = useState(false)
  const [localCaption, setLocalCaption] = useState(node.attrs.caption || '')

  // Refs
  const imageRef = useRef<HTMLImageElement>(null)
  const captionInputRef = useRef<HTMLTextAreaElement>(null)
  const resizeStartRef = useRef<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const resizeDirectionRef = useRef<string | null>(null)

  // Destructure node attributes
  const {
    src,
    alt,
    title,
    width,
    height,
    dataAlign,
    caption,
    captionPlacement,
    pendingDelete,
    pendingInsert,
  } = node.attrs

  // Sync local caption with node attrs
  useEffect(() => {
    setLocalCaption(caption || '')
  }, [caption])

  // Focus caption input when editing
  useEffect(() => {
    if (isEditingCaption && captionInputRef.current) {
      captionInputRef.current.focus()
      captionInputRef.current.select()
    }
  }, [isEditingCaption])

  // No longer force width to 100% - images show at natural size by default
  // Width is only set explicitly when user resizes via drag handles

  // Resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault()
      e.stopPropagation()

      if (imageRef.current) {
        setIsResizing(true)
        resizeDirectionRef.current = direction

        const rect = imageRef.current.getBoundingClientRect()

        resizeStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          width: rect.width,
          height: rect.height,
        }

        document.addEventListener('mousemove', handleResizeMove)
        document.addEventListener('mouseup', handleResizeEnd)
      }
    },
    []
  )

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeStartRef.current || !imageRef.current) return

    const { x, width: startWidth } = resizeStartRef.current
    const diffX = e.clientX - x

    let newWidth = startWidth

    if (resizeDirectionRef.current?.includes('right')) {
      newWidth = startWidth + diffX
    } else if (resizeDirectionRef.current?.includes('left')) {
      newWidth = startWidth - diffX
    }

    // Min/Max constraints
    const parentWidth = imageRef.current.parentElement?.clientWidth || 800
    newWidth = Math.max(50, Math.min(newWidth, parentWidth))

    // Update local DOM for smoothness
    imageRef.current.style.width = `${newWidth}px`
  }, [])

  const handleResizeEnd = useCallback(() => {
    if (imageRef.current) {
      const finalWidth = imageRef.current.offsetWidth
      const parentWidth = imageRef.current.parentElement?.clientWidth || 1
      const percentage = Math.round((finalWidth / parentWidth) * 100)

      updateAttributes({
        width: `${percentage}%`,
        height: 'auto',
      })
    }

    setIsResizing(false)
    resizeStartRef.current = null
    resizeDirectionRef.current = null

    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }, [updateAttributes, handleResizeMove])

  // Alignment handler
  const setAlign = useCallback(
    (align: ImageAlignment) => {
      updateAttributes({ dataAlign: align })
    },
    [updateAttributes]
  )

  // Caption handlers
  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalCaption(e.target.value)
    },
    []
  )

  const handleCaptionBlur = useCallback(() => {
    updateAttributes({ caption: localCaption })
    setIsEditingCaption(false)
  }, [localCaption, updateAttributes])

  const handleCaptionKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleCaptionBlur()
      } else if (e.key === 'Escape') {
        setLocalCaption(caption || '')
        setIsEditingCaption(false)
      }
    },
    [caption, handleCaptionBlur]
  )

  const toggleCaptionPlacement = useCallback(() => {
    updateAttributes({
      captionPlacement: captionPlacement === 'above' ? 'below' : 'above',
    })
  }, [captionPlacement, updateAttributes])

  // Compute wrapper styles based on alignment
  const getWrapperStyle = (): React.CSSProperties => {
    // If width is '100%' (default) or not set, show image at natural size
    // If width is explicitly set by user resize (e.g., '500px', '60%'), use that
    const isDefaultWidth = !width || width === '100%';
    const baseStyle: React.CSSProperties = {
      width: isDefaultWidth ? undefined : width,
      maxWidth: '100%',
    }

    switch (dataAlign) {
      case 'left':
        return {
          ...baseStyle,
          float: 'left',
          marginRight: '1rem',
          marginBottom: '0.5rem',
        }
      case 'right':
        return {
          ...baseStyle,
          float: 'right',
          marginLeft: '1rem',
          marginBottom: '0.5rem',
        }
      case 'center':
      default:
        return {
          ...baseStyle,
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'block',
          clear: 'both',
        }
    }
  }

  // Render caption element
  const renderCaption = () => {
    if (isEditingCaption) {
      return (
        <textarea
          ref={captionInputRef}
          className="image-caption-input"
          value={localCaption}
          onChange={handleCaptionChange}
          onBlur={handleCaptionBlur}
          onKeyDown={handleCaptionKeyDown}
          placeholder="Enter caption..."
          rows={2}
        />
      )
    }

    if (caption) {
      return (
        <figcaption
          className="image-caption"
          onClick={() => editor.isEditable && setIsEditingCaption(true)}
        >
          {caption}
        </figcaption>
      )
    }

    return null
  }

  return (
    <NodeViewWrapper
      className={`resizable-image-caption-node ${selected ? 'is-selected' : ''} ${
        pendingDelete ? 'pending-delete' : ''
      } ${pendingInsert ? 'pending-insert' : ''} ${isResizing ? 'is-resizing' : ''}`}
      data-align={dataAlign || 'center'}
      style={getWrapperStyle()}
    >
      <figure className="image-figure">
        {/* Caption above image */}
        {captionPlacement === 'above' && renderCaption()}

        {/* Image container */}
        <div className="image-container">
          <img
            ref={imageRef}
            src={src}
            alt={alt || ''}
            title={title}
            style={{
              width: (!width || width === '100%') ? 'auto' : '100%',
              maxWidth: '100%',
              display: 'block',
              opacity: pendingDelete || pendingInsert ? 0.85 : 1,
            }}
            draggable={false}
          />

          {/* Pending delete overlay */}
          {pendingDelete && (
            <div className="pending-overlay pending-delete-overlay">
              <div className="strikethrough-line" />
            </div>
          )}

          {/* Pending insert overlay */}
          {pendingInsert && <div className="pending-overlay pending-insert-overlay" />}

          {/* Action buttons - show when selected and editable */}
          {selected && editor.isEditable && (
            <>
              <div className="image-actions">
                {/* Alignment buttons */}
                <button
                  onClick={() => setAlign('left')}
                  className={dataAlign === 'left' ? 'is-active' : ''}
                  title="Align Left"
                  type="button"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  onClick={() => setAlign('center')}
                  className={dataAlign === 'center' || !dataAlign ? 'is-active' : ''}
                  title="Align Center"
                  type="button"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  onClick={() => setAlign('right')}
                  className={dataAlign === 'right' ? 'is-active' : ''}
                  title="Align Right"
                  type="button"
                >
                  <AlignRight size={16} />
                </button>

                <div className="action-separator" />

                {/* Caption toggle */}
                <button
                  onClick={() => setIsEditingCaption(true)}
                  className={caption ? 'is-active' : ''}
                  title={caption ? 'Edit Caption' : 'Add Caption'}
                  type="button"
                >
                  <Type size={16} />
                </button>

                {/* Caption placement toggle (only show if caption exists) */}
                {caption && (
                  <button
                    onClick={toggleCaptionPlacement}
                    title={`Move caption ${captionPlacement === 'above' ? 'below' : 'above'}`}
                    type="button"
                    className="caption-placement-toggle"
                  >
                    {captionPlacement === 'above' ? '↓' : '↑'}
                  </button>
                )}

                <div className="action-separator" />

                {/* Delete button */}
                <button
                  onClick={deleteNode}
                  title="Remove Image"
                  type="button"
                  className="delete-button"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Resize handles */}
              <div
                className="resize-handle top-left"
                onMouseDown={(e) => handleResizeStart(e, 'top-left')}
              />
              <div
                className="resize-handle top-right"
                onMouseDown={(e) => handleResizeStart(e, 'top-right')}
              />
              <div
                className="resize-handle bottom-left"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
              />
              <div
                className="resize-handle bottom-right"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              />
            </>
          )}
        </div>

        {/* Caption below image */}
        {captionPlacement !== 'above' && renderCaption()}
      </figure>
    </NodeViewWrapper>
  )
}

export default ResizableImageWithCaption
