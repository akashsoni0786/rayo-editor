// @ts-nocheck
"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"
// Stub useParams for rayo-editor package (no react-router-dom dependency)
const useParams = () => ({} as Record<string, string>)

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
  projectId?: string
}

export function isImageActive(
  editor: Editor | null,
  extensionName: string
): boolean {
  if (!editor) return false
  return editor.isActive(extensionName)
}

export function insertImage(
  editor: Editor | null,
  extensionName: string
): boolean {
  console.log('[insertImage] Called', { editor: !!editor, extensionName });
  if (!editor) return false

  if (extensionName === 'imageUpload') {
      console.log('[insertImage] Using setImageUploadNode command');
      // Try to use the chainable command to ensure focus
      try {
        return (editor.chain().focus() as any).setImageUploadNode().run();
      } catch (e) {
        console.error('[insertImage] Error calling setImageUploadNode:', e);
        // Fallback will happen below
      }
  }

  return editor
    .chain()
    .focus()
    .insertContent({
      type: extensionName,
    })
    .run()
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

  return {
    isActive,
    handleInsertImage,
    handleOpenGallery,
    isGalleryOpen,
    setIsGalleryOpen,
  }
}

export function ImageUploadButton({
  editor: providedEditor,
  extensionName = "imageUpload",
  text,
  className = "",
  disabled,
  onClick,
  children,
  projectId: providedProjectId,
  ref,
  ...buttonProps
}: ImageUploadButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const editor = useTiptapEditor(providedEditor)
  const { id: paramsProjectId } = useParams<{ id: string }>()
  const projectId = providedProjectId || paramsProjectId


  const {
    isActive,
    handleInsertImage,
    handleOpenGallery,
    isGalleryOpen,
    setIsGalleryOpen
  } = useImageUploadButton(editor, extensionName, disabled)

  // Listen for global open-image-gallery event
  React.useEffect(() => {
    const handleGlobalOpen = () => {
      if (!disabled && projectId) {
        setIsGalleryOpen(true);
      }
    };

    window.addEventListener('open-image-gallery', handleGlobalOpen);
    return () => window.removeEventListener('open-image-gallery', handleGlobalOpen);
  }, [disabled, projectId, setIsGalleryOpen]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      console.log('[ImageUploadButton] Clicked', { disabled, projectId, extensionName });
      // Always prevent default behavior first
      e.preventDefault()
      e.stopPropagation()

      if (!disabled) {
        // Use ImageUploadNode (placeholder block) instead of immediate gallery
        // This allows users to place the block first, then decide how to upload
        onClick?.(e)

        console.log('[ImageUploadButton] Attempting insert');
        const result = handleInsertImage();
        console.log('[ImageUploadButton] Insert result:', result);
      }
    },
    [onClick, disabled, projectId, handleOpenGallery, handleInsertImage, extensionName]
  )

  // Handle image selection from gallery
  const handleImageSelect = React.useCallback((image: ProjectImage, options: InsertOptions) => {
    if (!editor) return

    // Insert image using standard TipTap image extension
    const attrs: any = {
      src: image.url,
      alt: options.altText,
      title: image.original_filename,
      dataAlign: options.alignment // Pass alignment directly
    }

    if (options.width !== 'auto') {
      attrs.width = options.width
    }
    if (options.height !== 'auto') {
      attrs.height = options.height
    }

    editor.chain().focus().setImage(attrs).run()

    // Add caption if provided
    if (options.caption) {
      editor
        .chain()
        .focus()
        .insertContentAt(editor.state.selection.to + 1, {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: options.caption,
              marks: [{ type: 'italic' }]
            }
          ]
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

      {/* Image Gallery Dialog */}
      {projectId && (
        <ImageGalleryDialog
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onImageSelect={handleImageSelect}
          projectId={projectId}
          editor={editor}
        />
      )}
    </>
  )
}

export default ImageUploadButton
