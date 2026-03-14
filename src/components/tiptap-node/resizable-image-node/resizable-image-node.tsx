import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  GripVertical,
  Maximize2
} from 'lucide-react'
import './resizable-image-node.scss'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value)
const throttle = <T extends (...args: any[]) => any>(fn: T, wait: number): T => {
  let lastCall = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    const now = Date.now()
    const remaining = wait - (now - lastCall)
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null }
      lastCall = now
      fn(...args)
    } else if (!timer) {
      timer = setTimeout(() => { lastCall = Date.now(); timer = null; fn(...args) }, remaining)
    }
  }) as T
}

// Constants for image sizing
const IMAGE_MAX_SIZE = 2000
const IMAGE_MIN_SIZE = 50
const IMAGE_THROTTLE_WAIT_TIME = 16

// Size presets as percentage of container width
const SIZE_PRESETS = {
  S: 25,
  M: 50,
  L: 75,
}

interface Size {
  width: number
  height: number
}

const ResizeDirection = {
  TOP_LEFT: 'tl',
  TOP_RIGHT: 'tr',
  BOTTOM_LEFT: 'bl',
  BOTTOM_RIGHT: 'br',
}

// Memoized image component to prevent reloading on parent re-renders
interface MemoizedImageProps {
  src: string
  alt?: string
  style: React.CSSProperties
  onClick: () => void
  onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

const MemoizedImage = memo<MemoizedImageProps>(
  ({ src, alt, style, onClick, onLoad }) => {
    // Use a ref to store the image element and prevent DOM recreation
    const imgRef = useRef<HTMLImageElement>(null)

    // Update style directly on DOM element to avoid React re-render
    useEffect(() => {
      if (imgRef.current) {
        Object.assign(imgRef.current.style, style)
      }
    }, [style])

    return (
      <img
        ref={imgRef}
        alt={alt}
        className="image-view__body__image block"
        height="auto"
        onClick={onClick}
        onLoad={onLoad}
        src={src}
        style={style}
      />
    )
  },
  (prevProps, nextProps) => {
    // Re-render if src or width/height changes
    // Width changes need re-render for size presets (S, M, L) to work
    return (
      prevProps.src === nextProps.src &&
      prevProps.style?.width === nextProps.style?.width &&
      prevProps.style?.height === nextProps.style?.height
    )
  }
)

export const ResizableImageNode: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, deleteNode, selected, editor, getPos } = props

  const [maxSize, setMaxSize] = useState<Size>({
    width: IMAGE_MAX_SIZE,
    height: IMAGE_MAX_SIZE,
  })

  const [originalSize, setOriginalSize] = useState({
    width: 0,
    height: 0,
  })

  const [resizeDirections] = useState<string[]>([
    ResizeDirection.TOP_LEFT,
    ResizeDirection.TOP_RIGHT,
    ResizeDirection.BOTTOM_LEFT,
    ResizeDirection.BOTTOM_RIGHT,
  ])

  const [resizing, setResizing] = useState<boolean>(false)

  const [resizerState, setResizerState] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    dir: '',
  })

  const { src, alt, width: w, height: h, dataAlign, pendingDelete, pendingInsert, caption } = node.attrs

  // Debug log for pending images
  if (pendingInsert || pendingDelete) {
    console.log('🖼️ [ResizableImageNode] Pending image:', { pendingInsert, pendingDelete, dataAlign, align: dataAlign || 'center', width: w })
  }

  // Use ref to cache the image src and prevent unnecessary reloads
  const cachedSrcRef = useRef<string>(src || '')

  // Only update cached src when it actually changes
  if (src && src !== cachedSrcRef.current) {
    cachedSrcRef.current = src
  }

  // Caption editing state
  const [isEditingCaption, setIsEditingCaption] = useState(false)
  const [captionValue, setCaptionValue] = useState(caption || '')
  const captionInputRef = useRef<HTMLInputElement>(null)

  // Sync caption value when it changes from external sources (e.g., agent operations)
  useEffect(() => {
    if (!isEditingCaption) {
      setCaptionValue(caption || '')
    }
  }, [caption, isEditingCaption])

  // Compute inline and float styles based on alignment
  const inline = false
  const align = dataAlign || 'center'
  const inlineFloat = inline && (align === 'left' || align === 'right')

  const imgAttrs = useMemo(() => {
    // Handle all width formats: number (600), string number ("600"), percentage ("60%"), pixel string ("600px")
    const resolveSize = (val: any): string | undefined => {
      if (val == null) return undefined
      if (isNumber(val)) return `${val}px`
      if (typeof val === 'string') {
        if (val.endsWith('%') || val.endsWith('px') || val === 'auto') return val
        const parsed = parseInt(val, 10)
        if (!isNaN(parsed)) return `${parsed}px`
      }
      return undefined
    }
    const width = resolveSize(w)
    const height = resolveSize(h)

    const floatStyle = inlineFloat ? { float: align as 'left' | 'right' } : {}

    return {
      src: src || undefined,
      alt: alt || undefined,
      style: {
        width: width || undefined,
        height: height || undefined,
        ...floatStyle,
      },
    }
  }, [src, alt, w, h, align, inlineFloat])

  const imageMaxStyle = useMemo(() => {
    const {
      style: { width },
    } = imgAttrs

    // If width is a percentage, apply it to the body container so the image inside can use 100%
    // This ensures the resizer handles are correctly positioned
    if (typeof width === 'string' && width.endsWith('%')) {
      return { width }
    }

    return { width: width === '100%' ? width : undefined }
  }, [imgAttrs])

  // Memoize image style to prevent re-renders causing image reload
  const imageStyle = useMemo(() => {
    const baseStyle = { ...imgAttrs.style }

    // If the width is a percentage, the container will have that percentage width
    // So the image inside should be 100% of the container
    if (typeof baseStyle.width === 'string' && baseStyle.width.endsWith('%')) {
      baseStyle.width = '100%'
    }

    return {
      ...baseStyle,
      opacity: (pendingDelete || pendingInsert) ? 0.85 : 1
    }
  }, [imgAttrs.style, pendingDelete, pendingInsert])

  // Wrapper style: in pending state, use fit-content so the green/red border
  // wraps tightly around the image. In non-pending state, use normal sizing.
  const wrapperStyle = useMemo(() => {
    const isCentered = align === 'center'
    const baseStyle = {
      float: inlineFloat ? (align as 'left' | 'right') : (align === 'left' ? 'left' : align === 'right' ? 'right' : undefined),
      margin: inlineFloat
        ? (align === 'left' ? '1em 1em 1em 0' : '1em 0 1em 1em')
        : (isCentered ? '0 auto' : undefined),
      display: isCentered ? 'block' : (inline ? 'inline' : 'inline-block'),
      textAlign: isCentered ? ('center' as const) : (inlineFloat ? undefined : (align as 'left' | 'center' | 'right')),
    }

    if (pendingInsert || pendingDelete) {
      // Pending state: outline is on the body div (tight around image),
      // so wrapper uses same sizing as non-pending
      return {
        ...baseStyle,
        width: imgAttrs.style?.width ?? 'auto',
        ...(inlineFloat ? {} : imageMaxStyle),
      }
    }

    // Non-pending state
    return {
      ...baseStyle,
      width: imgAttrs.style?.width ?? 'auto',
      ...(inlineFloat ? {} : imageMaxStyle),
    }
  }, [inlineFloat, align, inline, imgAttrs.style?.width, imageMaxStyle, pendingInsert, pendingDelete])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    setOriginalSize({
      width: target.naturalWidth,
      height: target.naturalHeight,
    })
  }, [])

  // Select image on click
  const selectImage = useCallback(() => {
    if (editor && typeof getPos === 'function') {
      const pos = getPos()
      if (pos !== undefined && pos !== null) {
        editor.commands.setNodeSelection(pos)
      }
    }
  }, [editor, getPos])

  const getMaxSize = useCallback(
    throttle(() => {
      if (!editor) return
      const { width } = getComputedStyle(editor.view.dom)
      setMaxSize((prev) => {
        return {
          ...prev,
          width: Number.parseInt(width, 10),
        }
      })
    }, IMAGE_THROTTLE_WAIT_TIME),
    [editor]
  )

  function onMouseDown(e: React.MouseEvent, dir: string) {
    e.preventDefault()
    e.stopPropagation()

    const maxWidth = maxSize.width

    // Always read the ACTUAL rendered size from DOM — no parsing, no guessing
    const bodyEl = (e.currentTarget as HTMLElement).closest('.image-view__body') as HTMLElement
    let width = bodyEl?.clientWidth || 0
    let height = bodyEl?.clientHeight || 0

    // Fallback to natural size if DOM read fails
    if (!width) {
      width = Math.min(originalSize.width, maxWidth)
      const aspectRatio = originalSize.width / (originalSize.height || 1)
      height = Math.round(width / aspectRatio)
    }

    width = Math.min(width, maxWidth)

    setResizing(true)

    setResizerState({
      x: e.clientX,
      y: e.clientY,
      w: width,
      h: height,
      dir,
    })
  }

  const onMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!resizing) {
        return
      }

      const { x, w, dir } = resizerState

      const dx = (e.clientX - x) * (/l/.test(dir) ? -1 : 1)

      const width = clamp(w + dx, IMAGE_MIN_SIZE, maxSize.width)
      const height = null

      updateAttributes({
        width,
        height,
      })
    }, IMAGE_THROTTLE_WAIT_TIME),
    [resizing, resizerState, maxSize, updateAttributes]
  )

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!resizing) {
        return
      }

      setResizerState({
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        dir: '',
      })
      setResizing(false)

      selectImage()
    },
    [resizing]
  )

  const onEvents = useCallback(() => {
    document?.addEventListener('mousemove', onMouseMove, true)
    document?.addEventListener('mouseup', onMouseUp, true)
  }, [onMouseMove, onMouseUp])

  const offEvents = useCallback(() => {
    document?.removeEventListener('mousemove', onMouseMove, true)
    document?.removeEventListener('mouseup', onMouseUp, true)
  }, [onMouseMove, onMouseUp])

  useEffect(() => {
    if (resizing) {
      onEvents()
    } else {
      offEvents()
    }

    return () => {
      offEvents()
    }
  }, [resizing, onEvents, offEvents])

  const resizeOb: ResizeObserver = useMemo(() => {
    return new ResizeObserver(() => getMaxSize())
  }, [getMaxSize])

  useEffect(() => {
    if (editor?.view?.dom) {
      // Get initial max size on mount
      getMaxSize()
      resizeOb.observe(editor.view.dom)

      return () => {
        resizeOb.disconnect()
      }
    }
  }, [editor?.view?.dom, resizeOb, getMaxSize])

  const setAlign = (newAlign: 'left' | 'center' | 'right') => {
    updateAttributes({ dataAlign: newAlign })
  }

  // Set size based on preset (percentage of container)
  const setSize = useCallback((size: 'S' | 'M' | 'L') => {
    const percentage = SIZE_PRESETS[size]
    // Get actual container width from editor view
    let containerWidth = maxSize.width
    if (editor?.view?.dom) {
      const { width } = getComputedStyle(editor.view.dom)
      containerWidth = Number.parseInt(width, 10) || containerWidth
    }
    const newWidth = Math.round((containerWidth * percentage) / 100)
    console.log(`[Image Size] Setting ${size}: ${percentage}% of ${containerWidth}px = ${newWidth}px`)

    // Update attributes
    updateAttributes({ width: newWidth, height: null })

    // Re-select the node to ensure toolbar stays visible
    if (editor && typeof getPos === 'function') {
      const pos = getPos()
      if (pos !== undefined && pos !== null) {
        setTimeout(() => {
          editor.commands.setNodeSelection(pos)
        }, 0)
      }
    }
  }, [editor, getPos, maxSize.width, updateAttributes])

  // Get current size preset based on width
  const getCurrentSize = () => {
    if (!w) return null

    // Handle percentage-based width (e.g., '60%', '25%')
    if (typeof w === 'string' && w.endsWith('%')) {
      const percentage = parseInt(w, 10)
      if (isNaN(percentage)) return null
      if (percentage <= 30) return 'S'
      if (percentage <= 60) return 'M'
      if (percentage <= 85) return 'L'
      return null
    }

    // Handle pixel-based width
    if (!maxSize.width) return null
    const currentWidth = typeof w === 'number' ? w : parseInt(w, 10)
    if (isNaN(currentWidth)) return null

    const percentage = (currentWidth / maxSize.width) * 100
    if (percentage <= 30) return 'S'
    if (percentage <= 60) return 'M'
    if (percentage <= 85) return 'L'
    return null
  }

  const currentSize = getCurrentSize()

  // Sync caption value when caption attribute changes
  useEffect(() => {
    setCaptionValue(caption || '')
  }, [caption])

  // Focus caption input when editing starts
  useEffect(() => {
    if (isEditingCaption && captionInputRef.current) {
      captionInputRef.current.focus()
      captionInputRef.current.select()
    }
  }, [isEditingCaption])

  // Handle caption save — also fill alt text if empty
  const handleCaptionSave = useCallback(() => {
    const trimmed = captionValue.trim()
    const updates: Record<string, any> = { caption: trimmed }
    if (trimmed && !alt) {
      updates.alt = trimmed
    }
    updateAttributes(updates)
    setIsEditingCaption(false)
  }, [captionValue, alt, updateAttributes])

  // Handle caption key events
  const handleCaptionKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCaptionSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setCaptionValue(caption || '')
      setIsEditingCaption(false)
    }
  }, [caption, handleCaptionSave])

  // Handle caption blur
  const handleCaptionBlur = useCallback(() => {
    handleCaptionSave()
  }, [handleCaptionSave])

  return (
    <NodeViewWrapper
      as={inline ? 'span' : 'div'}
      className={`image-view ${pendingInsert ? 'image-view--pending-insert' : ''} ${pendingDelete ? 'image-view--pending-delete' : ''}`}
      style={{ ...wrapperStyle, ...(selected && editor?.isEditable ? { zIndex: 50 } : {}) }}
    >
      <div
        data-drag-handle
        draggable="true"
        style={imageMaxStyle}
        className={`image-view__body ${selected ? 'image-view__body--focused' : ''} ${
          resizing ? 'image-view__body--resizing' : ''
        }`}
      >
        <MemoizedImage
          src={cachedSrcRef.current}
          alt={imgAttrs.alt}
          style={imageStyle}
          onClick={selectImage}
          onLoad={onImageLoad}
        />

        {/* Red overlay for pending delete */}
        {pendingDelete && (
          <div className="image-view__body__overlay image-view__body__overlay--delete">
            <div className="image-view__body__overlay__line" />
          </div>
        )}

        {/* Green overlay for pending insert */}
        {pendingInsert && (
          <div className="image-view__body__overlay image-view__body__overlay--insert" />
        )}

        {/* Resize handles - shown when selected or resizing */}
        {editor?.isEditable && (selected || resizing) && (
          <div className="image-resizer">
            {resizeDirections?.map((direction) => {
              return (
                <span
                  className={`image-resizer__handler image-resizer__handler--${direction}`}
                  key={`image-dir-${direction}`}
                  onMouseDown={(e) => onMouseDown(e, direction)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Caption in normal flow when it has content */}
      {caption && (
        <div className="image-caption">
          {editor?.isEditable && selected && !pendingInsert && !pendingDelete ? (
            isEditingCaption ? (
              <input
                ref={captionInputRef}
                type="text"
                className="image-caption__input"
                value={captionValue}
                onChange={(e) => setCaptionValue(e.target.value)}
                onKeyDown={handleCaptionKeyDown}
                onBlur={handleCaptionBlur}
                placeholder="Add a caption..."
              />
            ) : (
              <span
                className="image-caption__text image-caption__text--editable"
                onClick={() => setIsEditingCaption(true)}
              >
                {caption}
              </span>
            )
          ) : (
            <span className="image-caption__text">{caption}</span>
          )}
        </div>
      )}

      {/* Overlay: caption placeholder + toolbar — absolute positioned, no layout shift */}
      {editor?.isEditable && selected && !pendingInsert && !pendingDelete && (
        <div className="image-tools-overlay">
          {!caption && (
            <div className="image-caption">
              {isEditingCaption ? (
                <input
                  ref={captionInputRef}
                  type="text"
                  className="image-caption__input"
                  value={captionValue}
                  onChange={(e) => setCaptionValue(e.target.value)}
                  onKeyDown={handleCaptionKeyDown}
                  onBlur={handleCaptionBlur}
                  placeholder="Add a caption..."
                />
              ) : (
                <span
                  className="image-caption__text image-caption__text--editable"
                  onClick={() => setIsEditingCaption(true)}
                >
                  Add a caption...
                </span>
              )}
            </div>
          )}
          <div className="image-toolbar">
            {/* Drag handle */}
            <button
              className="image-toolbar__btn image-toolbar__drag"
              data-drag-handle
              draggable="true"
              title="Drag to reorder"
            >
              <GripVertical size={18} />
            </button>

            {/* Fullwidth toggle */}
            <button
              className={`image-toolbar__btn ${!w || w === '100%' ? 'is-active' : ''}`}
              onClick={() => updateAttributes({ width: null, height: null })}
              title="Full width"
            >
              <Maximize2 size={18} />
            </button>

            <div className="image-toolbar__divider" />

            {/* Size presets */}
            <button
              type="button"
              className={`image-toolbar__btn image-toolbar__btn--text ${currentSize === 'S' ? 'is-active' : ''}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSize('S'); }}
              title="Small (25%)"
            >
              S
            </button>
            <button
              type="button"
              className={`image-toolbar__btn image-toolbar__btn--text ${currentSize === 'M' ? 'is-active' : ''}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSize('M'); }}
              title="Medium (50%)"
            >
              M
            </button>
            <button
              type="button"
              className={`image-toolbar__btn image-toolbar__btn--text ${currentSize === 'L' ? 'is-active' : ''}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSize('L'); }}
              title="Large (75%)"
            >
              L
            </button>

            <div className="image-toolbar__divider" />

            {/* Alignment */}
            <button
              className={`image-toolbar__btn ${align === 'left' ? 'is-active' : ''}`}
              onClick={() => setAlign('left')}
              title="Align left"
            >
              <AlignLeft size={18} />
            </button>
            <button
              className={`image-toolbar__btn ${align === 'center' || !align ? 'is-active' : ''}`}
              onClick={() => setAlign('center')}
              title="Align center"
            >
              <AlignCenter size={18} />
            </button>
            <button
              className={`image-toolbar__btn ${align === 'right' ? 'is-active' : ''}`}
              onClick={() => setAlign('right')}
              title="Align right"
            >
              <AlignRight size={18} />
            </button>

            <div className="image-toolbar__divider" />

            {/* Delete */}
            <button
              className="image-toolbar__btn image-toolbar__btn--danger"
              onClick={deleteNode}
              title="Delete image"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}
