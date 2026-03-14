import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- TipTap UI Components ---
import { Button } from "../../tiptap-ui-primitive/button"

// --- Icons ---
import { LinkIcon } from "../../tiptap-icons/link-icon"

// --- Utils ---
// Link preview functionality removed


interface LinkBubbleProps {
  editor: Editor
  onCancel?: () => void // Optional callback for when used in text selection bubble
}

export const LinkBubble: React.FC<LinkBubbleProps> = ({ editor, onCancel }) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isLinkActive = editor.isActive('link')
  const hasTextSelection = !editor.state.selection.empty

  React.useEffect(() => {
    if (isLinkActive) {
      setLinkUrl(editor.getAttributes('link').href || "")
      setIsEditing(false)
    } else if (hasTextSelection && onCancel) {
      // Only start editing mode if we have a text selection AND we're in text selection bubble mode
      setLinkUrl("")
      setIsEditing(true)
    }
  }, [editor, isLinkActive, hasTextSelection, onCancel])

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleEdit = () => {
    // Get current URL when starting to edit
    const currentUrl = editor.getAttributes('link').href || ""
    setLinkUrl(currentUrl)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (linkUrl.trim()) {
      const href = linkUrl.trim()
      const normalizedHref = /^(https?:\/\/|ftp:\/\/|mailto:)/i.test(href) ? href : `https://${href}`
      // Use TipTap's standard link commands
      if (isLinkActive) {
        // Editing existing link
        editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedHref, target: '_blank', rel: 'noopener noreferrer' }).run()
      } else {
        // Creating new link from selection
        editor.chain().focus().setLink({ href: normalizedHref, target: '_blank', rel: 'noopener noreferrer' }).run()
      }
      
      setIsEditing(false)
      
      // If we're in text selection mode (have onCancel), close the bubble
      if (onCancel) {
        onCancel()
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (isLinkActive) {
      setLinkUrl(editor.getAttributes('link').href || "")
      setIsEditing(false)
    } else {
      setLinkUrl("")
      setIsEditing(false)
      // If we're creating a new link and have an onCancel callback, call it
      onCancel?.()
    }
  }

  const handleRemove = () => {
    editor.chain().focus().unsetLink().run()
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const currentUrl = editor.getAttributes('link').href || ""

  // If we have text selection but no active link, OR we're explicitly editing, show editing mode
  if (isEditing) {
    return (
      <div className="link-bubble editing">
        <input
          ref={inputRef}
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter URL..."
          className="link-input"
        />
        <div className="link-actions">
          <Button
            data-style="ghost"
            data-size="sm"
            onClick={handleSave}
            disabled={!linkUrl.trim()}
          >
            Save
          </Button>
          <Button
            data-style="ghost"
            data-size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="link-bubble">
      <div className="link-preview">
        <LinkIcon className="link-icon" />
        {currentUrl ? (
          <span className="link-text" title={currentUrl}>
            {currentUrl.length > 50 ? `${currentUrl.substring(0, 47)}...` : currentUrl}
          </span>
        ) : (
          <span className="link-text">No URL</span>
        )}
      </div>
      <div className="link-actions">
      <Button
        data-style="ghost"
        data-size="sm"
        onClick={handleEdit}
      >
        Edit
      </Button>
      <Button
        data-style="ghost"
        data-size="sm"
        onClick={handleRemove}
      >
        Remove
      </Button>
      </div>
    </div>
  )
}