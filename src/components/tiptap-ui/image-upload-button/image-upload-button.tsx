"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"
// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"

// --- Icons ---
import { ImagePlusIcon } from "../../tiptap-icons/image-plus-icon"

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button"
import { Button } from "../../tiptap-ui-primitive/button"

// --- Gallery Components ---
import ImageGalleryDialog, { ProjectImage, InsertOptions } from "../image-gallery/ImageGalleryDialog"

export interface ImageUploadButtonProps extends ButtonProps {
  editor?: Editor | null
  text?: string
  extensionName?: string
  images?: ProjectImage[]
  isLoadingImages?: boolean
  onUpload?: (formData: FormData) => Promise<ProjectImage>
}

export function isImageActive(editor: Editor | null, extensionName: string): boolean {
  if (!editor) return false
  return editor.isActive(extensionName)
}

export function insertImage(editor: Editor | null, extensionName: string): boolean {
  if (!editor) return false

  if (extensionName === 'imageUpload') {
    try {
      return (editor.chain().focus() as any).setImageUploadNode().run();
    } catch (e) {
      // fallback below
    }
  }

  return editor.chain().focus().insertContent({ type: extensionName }).run()
}

export function useImageUploadButton(
  editor: Editor | null,
  extensionName: string = "imageUpload",
  disabled: boolean = false
) {
  const isActive = isImageActive(editor, extensionName)
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false)

  const handleOpenGallery = React.useCallback(() => {
    if (disabled) return false
    setIsGalleryOpen(true)
    return true
  }, [disabled])

  const handleInsertImage = React.useCallback(() => {
    if (disabled) return false
    return insertImage(editor, extensionName)
  }, [editor, extensionName, disabled])

  return { isActive, handleInsertImage, handleOpenGallery, isGalleryOpen, setIsGalleryOpen }
}

export function ImageUploadButton({
  editor: providedEditor,
  extensionName = "imageUpload",
  text,
  className = "",
  disabled,
  onClick,
  children,
  images,
  isLoadingImages,
  onUpload,
  ref,
  ...buttonProps
}: ImageUploadButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const editor = useTiptapEditor(providedEditor)
  const hasGallery = !!images

  const { isActive, handleInsertImage, handleOpenGallery, isGalleryOpen, setIsGalleryOpen } =
    useImageUploadButton(editor, extensionName, disabled)

  // Listen for global open-image-gallery event (from image-upload-node placeholder)
  React.useEffect(() => {
    const handleGlobalOpen = (e: Event) => {
      if (!disabled && hasGallery) {
        // Signal back to the node that the gallery is handling this, so it skips the file picker
        const customEvent = e as CustomEvent
        customEvent.detail?.onOpen?.()
        setIsGalleryOpen(true)
      }
    }
    window.addEventListener('open-image-gallery', handleGlobalOpen)
    return () => window.removeEventListener('open-image-gallery', handleGlobalOpen)
  }, [disabled, hasGallery, setIsGalleryOpen])

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        onClick?.(e)
        if (hasGallery) {
          handleOpenGallery()
        } else {
          handleInsertImage()
        }
      }
    },
    [onClick, disabled, hasGallery, handleOpenGallery, handleInsertImage]
  )

  const handleImageSelect = React.useCallback((image: ProjectImage, options: InsertOptions) => {
    if (!editor) return

    const attrs: any = {
      src: image.url,
      alt: options.altText,
      title: image.original_filename,
      dataAlign: options.alignment
    }
    if (options.width !== 'auto') attrs.width = options.width
    if (options.height !== 'auto') attrs.height = options.height

    editor.chain().focus().setImage(attrs).run()

    if (options.caption) {
      editor.chain().focus()
        .insertContentAt(editor.state.selection.to + 1, {
          type: 'paragraph',
          content: [{ type: 'text', text: options.caption, marks: [{ type: 'italic' }] }]
        })
        .run()
    }
  }, [editor])

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <>
      <Button
        ref={ref}
        type="button"
        className={className.trim()}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        aria-label="Add image"
        aria-pressed={isActive}
        tooltip="Add image"
        onClick={handleClick}
        {...buttonProps}
      >
        {children || (
          <>
            <ImagePlusIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>

      {hasGallery && (
        <ImageGalleryDialog
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onImageSelect={handleImageSelect}
          images={images}
          isLoadingImages={isLoadingImages}
          onUpload={onUpload}
          editor={editor}
        />
      )}
    </>
  )
}

export default ImageUploadButton
