import * as React from "react"
import * as ReactDOM from "react-dom"
import { EditorContent, EditorContext, useEditor, BubbleMenu, FloatingMenu, type Editor } from "@tiptap/react"
import { useMotionValue } from "framer-motion"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
// import { Image } from "@tiptap/extension-image" // Replaced by ResizableImageExtension
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"
import { FontFamily } from "@tiptap/extension-font-family"
import { TextStyle } from "@tiptap/extension-text-style"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { CustomTable } from "../../tiptap-extension/table-extension"

// --- TipTap Core Extensions ---
import { Link } from "@tiptap/extension-link"
import { Youtube } from "../../tiptap-extension/youtube-extension"
import { InstagramEmbed, TwitterEmbed, getInstagramId, getTwitterId } from "../../common/tiptap-editor/extensions/EmbedExtension"

// --- Custom Extensions ---
import { Selection } from "../../tiptap-extension/selection-extension"
import { TrailingNode } from "../../tiptap-extension/trailing-node-extension"
import { DiffInsertion, DiffDeletion } from "../../tiptap-extension/diff-marks-extension"
import { VersionComparisonExtension } from "../../../extensions/VersionComparison/VersionComparisonExtension"
import { ReferenceManagerExtension } from "../../tiptap-extension/reference-manager-extension"
import { ResizableImageExtension } from "../../tiptap-extension/resizable-image-extension"
import { CustomCodeBlock } from "../../tiptap-extension/code-block-extension"
import { AriScoreExtension } from "../../tiptap-extension/ari-score-extension"
import { SearchAndReplace } from "../../../extensions/search-and-replace"
import { TextSelection } from "@tiptap/pm/state"

// --- UI Primitives ---
import { Spacer } from "../../tiptap-ui-primitive/spacer"
import { Button } from "../../tiptap-ui-primitive/button"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../../tiptap-ui-primitive/toolbar"
import {
  AnimatedToolbar,
  AnimatedToolbarGroup,
  AnimatedToolbarSeparator,
} from "../../tiptap-ui-primitive/toolbar/animated-toolbar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../../tiptap-ui-primitive/dropdown-menu"

// --- Tiptap Node ---
import { ImageUploadNode } from "../../tiptap-node/image-upload-node/image-upload-node-extension"
import "../../tiptap-node/code-block-node/code-block-node.scss"
import "../../tiptap-node/list-node/list-node.scss"
import "../../tiptap-node/image-node/image-node.scss"
import "../../tiptap-node/paragraph-node/paragraph-node.scss"
import "../../tiptap-node/table-node/table-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "../../tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "../../tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "../../tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "../../tiptap-ui/blockquote-button"
import { CodeBlockButton } from "../../tiptap-ui/code-block-button"
import { MarkButton } from "../../tiptap-ui/mark-button"
import { TextAlignButton } from "../../tiptap-ui/text-align-button"
// import { UndoRedoButton } from "../../tiptap-ui/undo-redo-button" // Removed - not needed
import { FontFamilyDropdownMenu } from "../../tiptap-ui/font-family-dropdown-menu"
import { TableDropdownMenu } from "../../tiptap-ui/table-dropdown-menu"
import { TextAlignDropdownMenu } from "../../tiptap-ui/text-align-dropdown-menu"
import { TextFormatDropdownMenu } from "../../tiptap-ui/text-format-dropdown-menu"
import { SearchAndReplace as SearchAndReplaceUI } from "../../tiptap-ui/search-and-replace/search-and-replace"

// --- Icons ---
import { HeadingIcon } from "../../tiptap-icons/heading-icon"
import { HeadingOneIcon } from "../../tiptap-icons/heading-one-icon"
import { HeadingTwoIcon } from "../../tiptap-icons/heading-two-icon"
import { HeadingThreeIcon } from "../../tiptap-icons/heading-three-icon"
import { HeadingFourIcon } from "../../tiptap-icons/heading-four-icon"
import { HeadingFiveIcon } from "../../tiptap-icons/heading-five-icon"
import { ListIcon } from "../../tiptap-icons/list-icon"
import { ListOrderedIcon } from "../../tiptap-icons/list-ordered-icon"
import { BlockQuoteIcon } from "../../tiptap-icons/block-quote-icon"
import { ImagePlusIcon } from "../../tiptap-icons/image-plus-icon"
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon"
import { TableIcon } from "../../tiptap-icons/table-icon"
import { LinkIcon } from "../../tiptap-icons/link-icon"
import { CheckIcon } from "../../tiptap-icons/check-icon"
import { XIcon } from "../../tiptap-icons/x-icon"
import { EditIcon } from "../../tiptap-icons/edit-icon"
import { TrashIcon } from "../../tiptap-icons/trash-icon"

// --- Hooks ---
// import { useMobile } from "../../../hooks/use-mobile"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "../../../lib/tiptap-utils"

// --- Export Libraries ---
import { saveAs } from 'file-saver'
// @ts-ignore
import { asBlob } from 'html-docx-js-typescript'

// --- Components ---
import { TableBubble } from "./table-bubble"
import { GenerativeMenuSwitch } from "../../tiptap-ui/ai/GenerativeMenuSwitch"
import { TextButtons } from "../../tiptap-ui/ai/TextButtons"
// Popover removed - using fixed overlay dialog instead (avoids floating-ui bundling issues)


// Sexy Link Edit Component with inline dialog
const LinkEditBubble: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState('')
  const [faviconError, setFaviconError] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const rawUrl = editor.getAttributes('link').href || ''
  const currentUrl = normalizeUrl(rawUrl)

  // Extract favicon URL from current link
  const getFaviconUrl = (url: string): string => {
    try {
      const normalized = normalizeUrl(url)
      if (normalized && (normalized.startsWith('http://') || normalized.startsWith('https://'))) {
        const urlObj = new URL(normalized)
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=16`
      }
    } catch (error) {
      // Invalid URL
    }
    return ''
  }

  const faviconUrl = getFaviconUrl(rawUrl)

  // Reset favicon error when URL changes
  React.useEffect(() => {
    setFaviconError(false)
  }, [currentUrl])

  React.useEffect(() => {
    if (isEditing) {
      setLinkUrl(currentUrl)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 50)
    }
  }, [isEditing, currentUrl])

  const handleSave = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalizeUrl(linkUrl), target: '_blank', rel: 'noopener noreferrer' }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLinkUrl(currentUrl)
    setIsEditing(false)
  }

  const handleRemoveLink = () => {
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

  const handleOpenLink = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="link-bubble">
      {isEditing ? (
        // Edit mode - show input and buttons in one row
        <div className="link-edit-row">
          <input
            ref={inputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL..."
            className="link-input-inline"
          />
          <div className="link-buttons">
            <Button
              data-style="primary"
              data-size="sm"
              onClick={handleSave}
              disabled={!linkUrl.trim()}
              title="Save"
            >
              <CheckIcon className="tiptap-button-icon" />
            </Button>
            <Button
              data-style="ghost"
              data-size="sm"
              onClick={handleCancel}
              title="Cancel"
            >
              <XIcon className="tiptap-button-icon" />
            </Button>
          </div>
        </div>
      ) : (
        // View mode - show URL and buttons in one row
        <>
          <div className="link-preview">
            {faviconUrl && !faviconError ? (
              <img
                src={faviconUrl}
                alt="Site favicon"
                className="link-icon"
                onError={() => setFaviconError(true)}
                style={{
                  width: '16px',
                  height: '16px',
                  flexShrink: 0,
                  borderRadius: '2px'
                }}
              />
            ) : (
              <LinkIcon className="link-icon" />
            )}
            <span
              className="link-text"
              title={currentUrl}
              onClick={handleOpenLink}
            >
              {currentUrl}
            </span>
          </div>
          <div className="link-actions">
            <Button
              data-style="ghost"
              data-size="sm"
              onClick={() => setIsEditing(true)}
              title="Edit link"
            >
              <EditIcon className="tiptap-button-icon" />
            </Button>
            <Button
              data-style="ghost"
              data-size="sm"
              onClick={handleRemoveLink}
              title="Remove link"
            >
              <TrashIcon className="tiptap-button-icon" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// --- Utils ---
// Link preview functionality removed

// --- Styles ---
import "./blog-simple-editor.scss"
import "../../../styles/diff-styles.css"

// Export interface compatible with old TipTapEditor
export interface BlogSimpleEditorRef {
  getHTML: () => string;
  setHTML: (html: string) => void;
  clearContent: () => void;
  getPlainText: () => string;
  getEditor: () => Editor | null;
  focus: () => void;
  blur: () => void;
  /**
   * Sync the lastDispatchedContentRef to the current editor content.
   * Call this after Accept/Reject cleanup to prevent setContent from being triggered
   * when updateBlog echoes back, which would clear undo history.
   */
  syncLastDispatched: () => void;
  commands: {
    compareVersion: (versionHtml: string) => boolean;
    showBlockDiff: (versionHtml: string) => boolean;
    exitComparison: () => boolean;
    isComparing: () => boolean;
  };
}

export interface BlogSimpleEditorProps {
  initialValue?: string;
  onChange?: (html: string) => void;
  onAriScoreChange?: (score: number) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  documentTitle?: string;
  animated?: boolean;
  magnification?: number;
  distance?: number;
  spring?: {
    mass: number;
    stiffness: number;
    damping: number;
  };
  isStreaming?: boolean;
  disableAutoScroll?: boolean;
  onUserScrollChange?: (isScrolledUp: boolean) => void;
  titleElement?: React.ReactNode;
  projectId?: string; // Pass to enable Media Library image picker
}

// Ensure URLs have a protocol prefix so they don't become relative links
const normalizeUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (/^(https?:\/\/|ftp:\/\/|mailto:)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const MainToolbarContent = ({
  animated = false,
  mouseX,
  spring,
  distance,
  magnification,
  isScrollable = false,
  editor,
  documentTitle,
  projectId,
}: {
  animated?: boolean;
  mouseX?: any;
  spring?: any;
  distance?: number;
  magnification?: number;
  isScrollable?: boolean;
  editor?: Editor | null;
  documentTitle?: string;
  projectId?: string;
}) => {
  const Group = animated ? AnimatedToolbarGroup : ToolbarGroup;
  const Separator = animated ? AnimatedToolbarSeparator : ToolbarSeparator;
  
  const [showLinkDialog, setShowLinkDialog] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState('')
  const [linkPopupPos, setLinkPopupPos] = React.useState<{ top: number; left: number } | null>(null)
  const linkInputRef = React.useRef<HTMLInputElement>(null)
  const linkPopupRef = React.useRef<HTMLDivElement>(null)
  const linkButtonRef = React.useRef<HTMLDivElement>(null)

  // Close link popup when clicking outside
  React.useEffect(() => {
    if (!showLinkDialog) return
    const handleClickOutside = (e: MouseEvent) => {
      if (linkPopupRef.current && !linkPopupRef.current.contains(e.target as Node) &&
          linkButtonRef.current && !linkButtonRef.current.contains(e.target as Node)) {
        handleCancelLink()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLinkDialog])
  
  // Embed state (YouTube, Instagram, Twitter)
  const [isEmbedOpen, setIsEmbedOpen] = React.useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = React.useState(false)
  const [embedPlatform, setEmbedPlatform] = React.useState<'youtube' | 'instagram' | 'twitter' | null>(null)
  const [embedUrl, setEmbedUrl] = React.useState('')
  const [embedPopupPos, setEmbedPopupPos] = React.useState<{ top: number; left: number } | null>(null)
  const embedInputRef = React.useRef<HTMLInputElement>(null)
  const embedPopupRef = React.useRef<HTMLDivElement>(null)
  const embedButtonRef = React.useRef<HTMLDivElement>(null)

  // Close embed popup when clicking outside
  React.useEffect(() => {
    if (!showEmbedDialog) return
    const handleClickOutside = (e: MouseEvent) => {
      if (embedPopupRef.current && !embedPopupRef.current.contains(e.target as Node) &&
          embedButtonRef.current && !embedButtonRef.current.contains(e.target as Node)) {
        handleCancelEmbed()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmbedDialog])

  // Export state
  const [isExportOpen, setIsExportOpen] = React.useState(false)

  const handleAddLink = () => {
    if (linkButtonRef.current) {
      const rect = linkButtonRef.current.getBoundingClientRect()
      const popupWidth = 300
      const centerX = rect.left + rect.width / 2
      // Clamp so popup doesn't overflow viewport edges (10px margin)
      const clampedLeft = Math.min(
        Math.max(centerX, popupWidth / 2 + 10),
        window.innerWidth - popupWidth / 2 - 10
      )
      setLinkPopupPos({ top: rect.top - 10, left: clampedLeft })
    }
    setShowLinkDialog(true)
    setLinkUrl('')
    setTimeout(() => {
      if (linkInputRef.current) {
        linkInputRef.current.focus()
      }
    }, 50)
  }

  const handleSaveLink = () => {
    if (linkUrl.trim() && editor) {
      const href = normalizeUrl(linkUrl)
      editor.chain().focus().setLink({ href, target: '_blank', rel: 'noopener noreferrer' }).run()
    }
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const handleCancelLink = () => {
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveLink()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelLink()
    }
  }

  // Embed handlers (YouTube, Instagram, Twitter)
  const handleSelectPlatform = (platform: 'youtube' | 'instagram' | 'twitter') => {
    if (embedButtonRef.current) {
      const rect = embedButtonRef.current.getBoundingClientRect()
      const popupWidth = 300
      const centerX = rect.left + rect.width / 2
      const clampedLeft = Math.min(
        Math.max(centerX, popupWidth / 2 + 10),
        window.innerWidth - popupWidth / 2 - 10
      )
      setEmbedPopupPos({ top: rect.top - 10, left: clampedLeft })
    }
    setEmbedPlatform(platform)
    setIsEmbedOpen(false)
    setShowEmbedDialog(true)
    setEmbedUrl('')
    setTimeout(() => {
      if (embedInputRef.current) {
        embedInputRef.current.focus()
      }
    }, 50)
  }

  const handleSaveEmbed = () => {
    if (embedUrl.trim() && editor && embedPlatform) {
      const url = embedUrl.trim()
      
      if (embedPlatform === 'youtube') {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[a-zA-Z0-9_-]+/
        if (youtubeRegex.test(url)) {
          editor.commands.setYoutubeVideo({ src: url })
        } else {
          alert('Please enter a valid YouTube URL')
          return
        }
      } else if (embedPlatform === 'instagram') {
        const postId = getInstagramId(url)
        if (postId) {
          editor.commands.setInstagramEmbed({ src: url })
        } else {
          alert('Please enter a valid Instagram URL')
          return
        }
      } else if (embedPlatform === 'twitter') {
        const tweetId = getTwitterId(url)
        if (tweetId) {
          editor.commands.setTwitterEmbed({ src: url })
        } else {
          alert('Please enter a valid Twitter/X URL')
          return
        }
      }
    }
    setShowEmbedDialog(false)
    setEmbedUrl('')
    setEmbedPlatform(null)
  }

  const handleCancelEmbed = () => {
    setShowEmbedDialog(false)
    setEmbedUrl('')
    setEmbedPlatform(null)
  }

  const handleEmbedKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEmbed()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEmbed()
    }
  }

  const getEmbedPlaceholder = () => {
    switch (embedPlatform) {
      case 'youtube': return 'Paste YouTube URL...'
      case 'instagram': return 'Paste Instagram URL...'
      case 'twitter': return 'Paste Twitter/X URL...'
      default: return 'Paste URL...'
    }
  }

  // Helper to get safe filename from title
  const getSafeFilename = (title: string | undefined, extension: string): string => {
    if (!title || !title.trim()) {
      return `document.${extension}`
    }
    // Remove special characters and limit length
    const safe = title
      .trim()
      .replace(/[^a-z0-9\s-]/gi, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
      .substring(0, 50) // Limit to 50 chars
    return `${safe}.${extension}`
  }

  // Export handlers - Using iframe print approach like demo
  const handleExportPDF = () => {
    if (!editor) return

    // Get editor HTML content
    const htmlContent = editor.getHTML()
    if (!htmlContent) return

    // Create hidden iframe for printing
    const iframe = document.createElement('iframe')
    iframe.setAttribute('style', 'position: absolute; width: 0; height: 0; top: 0; left: 0;')
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    // HTML template with print styles
    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Document</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media print {
            @page {
              size: Letter;
              margin: 0.5in;
            }

            body {
              background: none;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
            }

            .print-container {
              width: 100%;
              box-sizing: border-box;
              padding: 20px;
            }

            /* Page break handling */
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              page-break-inside: avoid;
            }

            p, blockquote {
              page-break-inside: avoid;
            }

            img, table, figure, pre {
              page-break-inside: avoid;
              max-width: 100%;
              height: auto;
            }

            /* Remove any editor-specific classes that shouldn't print */
            .no-print {
              display: none;
            }
          }

          /* Base styles for content */
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
            line-height: 1.6;
            color: #333;
          }

          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
          }

          p {
            margin: 1em 0;
          }

          img {
            max-width: 100%;
            height: auto;
          }

          table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }

          table td, table th {
            border: 1px solid #ddd;
            padding: 8px;
          }

          blockquote {
            border-left: 3px solid #ccc;
            padding-left: 1em;
            margin-left: 0;
            color: #666;
          }

          pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
          }

          code {
            background: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${htmlContent}
        </div>
      </body>
      </html>
    `

    // Write content to iframe
    iframeDoc.open()
    iframeDoc.write(printHTML)
    iframeDoc.close()

    // Wait for iframe to load, then print
    iframe.addEventListener('load', () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
        } catch (error) {
          console.error('Print failed:', error)
        }

        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 100)
      }, 50)
    })

    setIsExportOpen(false)
  }

  const handleExportDOCX = async () => {
    if (!editor) return

    try {
      // 1. Get HTML Content from Editor
      const htmlContent = editor.getHTML()
      
      // 2. Pre-process HTML to convert images to Base64 (handling CORS)
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      const images = doc.getElementsByTagName('img')
      
      const imagePromises = Array.from(images).map(async (img) => {
        const src = img.getAttribute('src')
        if (src && !src.startsWith('data:')) {
          try {
            // Attempt 1: Fetch with standard CORS headers (credentials: omit)
            // Adding cache-busting to ensure fresh request and avoid 304 opaque responses
            const separator = src.includes('?') ? '&' : '?'
            const cacheBustedSrc = `${src}${separator}t=${Date.now()}`
            
            const response = await fetch(cacheBustedSrc, {
              mode: 'cors',
              credentials: 'omit',
              headers: { 'Cache-Control': 'no-cache' }
            })

            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
            
            const blob = await response.blob()
            
            // Convert blob to base64
            await new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => {
                if (reader.result) {
                  img.src = reader.result as string
                  resolve(null)
                } else {
                  reject(new Error('Empty result from FileReader'))
                }
              }
              reader.onerror = () => reject(new Error('FileReader error'))
              reader.readAsDataURL(blob)
            })
            
          } catch (err) {
            console.warn(`Failed to convert image ${src} to base64 via fetch, trying canvas fallback:`, err)
            
            // Attempt 2: Canvas Fallback (if fetch failed due to strict CORS but image load might work)
            try {
              await new Promise((resolve) => {
                const imageEl = new Image()
                imageEl.crossOrigin = "Anonymous"
                imageEl.onload = () => {
                   try {
                     const canvas = document.createElement('canvas')
                     canvas.width = imageEl.naturalWidth
                     canvas.height = imageEl.naturalHeight
                     const ctx = canvas.getContext('2d')
                     if (ctx) {
                        ctx.drawImage(imageEl, 0, 0)
                        const dataUrl = canvas.toDataURL('image/png')
                        img.src = dataUrl
                     }
                   } catch (e) {
                      console.warn('Canvas tainted, skipping image:', src)
                   }
                   resolve(null)
                }
                imageEl.onerror = () => resolve(null)
                
                // Add cache buster
                const separator = src.includes('?') ? '&' : '?'
                imageEl.src = `${src}${separator}t=${Date.now()}`
              })
            } catch (canvasErr) {
               console.warn('Canvas fallback failed:', canvasErr)
            }
          }
        }
      })

      await Promise.all(imagePromises)
      
      // 3. Get Processed HTML with Base64 Images
      // Wrap content in basic HTML structure as required by html-to-docx
      // Adding specific image styles to constrain width while maintaining aspect ratio
      // Also ensuring tables have 100% width but fixed layout to prevent overflow if possible
      
      // 5. Explicitly size images for Word A4 page width (approx 600-650px content width)
      // Some DOCX converters ignore CSS max-width and rely on explicit width/height attributes
      const MAX_DOC_WIDTH = 600; 

      const processedImages = doc.getElementsByTagName('img');
      // We need to wait for images to load to get dimensions if we want to scale them proportionally?
      // Since we already loaded them to convert to Base64 in the previous step, we likely have access to dimensions via the Image objects created there?
      // Actually, the previous loop used async map, but didn't store the dimensions in the DOM nodes.
      // We can iterate again. Since the src is now Base64, loading it into an Image object to check size is fast.
      
      const sizingPromises = Array.from(processedImages).map(img => {
          return new Promise((resolve) => {
              const src = img.getAttribute('src');
              if (!src) { resolve(null); return; }

              const i = new Image();
              i.onload = () => {
                  let width = i.naturalWidth;
                  let height = i.naturalHeight;

                  // Scale down if too wide
                  if (width > MAX_DOC_WIDTH) {
                      const ratio = height / width;
                      width = MAX_DOC_WIDTH;
                      height = Math.round(width * ratio);
                  }

                  // Set explicit attributes for DOCX
                  img.setAttribute('width', width.toString());
                  img.setAttribute('height', height.toString());
                  
                  // Also set style to enforce it
                  img.style.width = `${width}px`;
                  img.style.height = `${height}px`;
                  img.style.maxWidth = '100%';
                  
                  resolve(null);
              };
              i.onerror = () => resolve(null);
              i.src = src;
          });
      });

      await Promise.all(sizingPromises);

      const processedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${documentTitle || 'Document'}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; table-layout: fixed; }
              td, th { border: 1px solid black; padding: 5px; word-wrap: break-word; }
              /* Ensure images don't overflow visually in HTML context too */
              img { max-width: 100%; height: auto; } 
            </style>
        </head>
        <body>
            ${doc.body.innerHTML}
        </body>
        </html>
      `

      // 4. Generate DOCX using html-docx-js-typescript
      // This library works well in the browser and handles images if they are Base64 encoded
      const blob = await asBlob(processedHtml, {
        orientation: 'portrait',
        margins: { top: 720, bottom: 720, left: 720, right: 720 }, // TWIPS (1/1440 inch) or similar units
      }) as Blob

      // 5. Save File
      saveAs(blob, getSafeFilename(documentTitle, 'docx'))
      
    } catch (error) {
      console.error('Error generating DOCX:', error)
      // Fallback or alert user - silent failure or console error is acceptable for now
    } finally {
      setIsExportOpen(false)
    }
  }

  const handleExportHTML = () => {
    if (!editor) return
    const content = editor.getHTML()
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
    saveAs(blob, getSafeFilename(documentTitle, 'html'))
    setIsExportOpen(false)
  }

  const handleExportTXT = () => {
    if (!editor) return
    const content = editor.getText()
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, getSafeFilename(documentTitle, 'txt'))
    setIsExportOpen(false)
  }

  return (
    <>
      <Spacer className={isScrollable ? 'scrollable-spacer' : ''} />

      {/* Undo/Redo buttons removed as per user request */}

      <Group
        {...(animated && {
          mouseX,
          spring,
          distance,
          magnification
        })}
      >
        <SearchAndReplaceUI editor={editor} />
      </Group>

      <Separator />

      <Group
        {...(animated && {
          mouseX,
          spring,
          distance,
          magnification
        })}
      >
        <HeadingDropdownMenu levels={[1, 2, 3, 4, 5]} editor={editor} />
        <FontFamilyDropdownMenu editor={editor} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} editor={editor} />
        <TableDropdownMenu editor={editor} />
        <BlockquoteButton editor={editor} />
        <CodeBlockButton editor={editor} />
      </Group>

      <Separator />


      <Group
        {...(animated && {
          mouseX,
          spring,
          distance,
          magnification
        })}
      >
        <TextFormatDropdownMenu editor={editor} />
        <MarkButton type="superscript" editor={editor} />
        <MarkButton type="subscript" editor={editor} />
      </Group>

      <Separator />

      <Group
        {...(animated && {
          mouseX,
          spring,
          distance,
          magnification
        })}
      >
        <TextAlignDropdownMenu editor={editor} />
      </Group>

      <Separator />

      <Group
        {...(animated && {
          mouseX,
          spring,
          distance,
          magnification
        })}
      >
        <div ref={linkButtonRef} className="link-button-wrapper">
          <Button
            type="button"
            data-style="ghost"
            data-size="sm"
            onClick={handleAddLink}
            title="Add Link"
            className="tiptap-button"
          >
            <LinkIcon className="tiptap-button-icon" />
          </Button>
        </div>
        <ImageUploadButton text="Add" editor={editor} projectId={projectId} />

        {/* Embed Dropdown (YouTube, Instagram, Twitter) */}
        <div ref={embedButtonRef} style={{ display: 'inline-flex' }}>
        <DropdownMenu open={isEmbedOpen} onOpenChange={setIsEmbedOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              data-style="ghost"
              data-size="sm"
              title="Embed Media"
              tooltip="Embed"
            >
              <svg className="tiptap-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
              <ChevronDownIcon className="tiptap-button-dropdown-small" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleSelectPlatform('youtube')}
                  className="dropdown-menu-item-button"
                >
                  <svg className="tiptap-button-icon" width="14" height="14" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="tiptap-button-text">YouTube</span>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleSelectPlatform('instagram')}
                  className="dropdown-menu-item-button"
                >
                  <svg className="tiptap-button-icon" width="14" height="14" viewBox="0 0 24 24" fill="#E4405F">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="tiptap-button-text">Instagram</span>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleSelectPlatform('twitter')}
                  className="dropdown-menu-item-button"
                >
                  <svg className="tiptap-button-icon" width="14" height="14" viewBox="0 0 24 24" fill="#000000">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="tiptap-button-text">Twitter/X</span>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

        {/* Export Dropdown */}
        <DropdownMenu open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              data-style="ghost"
              data-size="sm"
              title="Export Document"
              tooltip="Export"
            >
              <svg className="tiptap-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <ChevronDownIcon className="tiptap-button-dropdown-small" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={handleExportPDF}
                  className="dropdown-menu-item-button"
                >
                  <span className="tiptap-button-text">Export as PDF</span>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={handleExportDOCX}
                  className="dropdown-menu-item-button"
                >
                  <span className="tiptap-button-text">Export as DOCX</span>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={handleExportHTML}
                  className="dropdown-menu-item-button"
                >
                  <span className="tiptap-button-text">Export as HTML</span>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={handleExportTXT}
                  className="dropdown-menu-item-button"
                >
                  <span className="tiptap-button-text">Export as TXT</span>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Group>

      <Spacer className={isScrollable ? 'scrollable-spacer' : ''} />

      {/* Embed URL popup — Portal to document.body */}
      {showEmbedDialog && embedPopupPos && ReactDOM.createPortal(
        <div
          ref={embedPopupRef}
          className="link-inline-popup"
          style={{
            position: 'fixed',
            top: embedPopupPos.top,
            left: embedPopupPos.left,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={embedInputRef}
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            onKeyDown={handleEmbedKeyDown}
            placeholder={
              embedPlatform === 'youtube' ? 'https://youtube.com/watch?v=...' :
              embedPlatform === 'instagram' ? 'https://instagram.com/p/...' :
              'https://twitter.com/user/status/...'
            }
            className="link-popup-input"
            autoFocus
          />
          <div className="link-popup-actions">
            <Button
              type="button"
              data-style="ghost"
              data-size="sm"
              onClick={handleSaveEmbed}
              disabled={!embedUrl.trim()}
              className="link-action-button"
            >
              <CheckIcon className="tiptap-button-icon" />
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="sm"
              onClick={handleCancelEmbed}
              className="link-action-button"
            >
              <XIcon className="tiptap-button-icon" />
            </Button>
          </div>
        </div>,
        document.body
      )}

      {/* Link popup — rendered via Portal to document.body so it never affects toolbar layout */}
      {showLinkDialog && linkPopupPos && ReactDOM.createPortal(
        <div
          ref={linkPopupRef}
          className="link-inline-popup"
          style={{
            position: 'fixed',
            top: linkPopupPos.top,
            left: linkPopupPos.left,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            placeholder="Enter URL..."
            className="link-popup-input"
            autoFocus
          />
          <div className="link-popup-actions">
            <Button
              type="button"
              data-style="ghost"
              data-size="sm"
              onClick={handleSaveLink}
              disabled={!linkUrl.trim()}
              className="link-action-button"
            >
              <CheckIcon className="tiptap-button-icon" />
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="sm"
              onClick={handleCancelLink}
              className="link-action-button"
            >
              <XIcon className="tiptap-button-icon" />
            </Button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}


export function BlogSimpleEditor({
  ref,
  initialValue = '',
  onChange,
  placeholder = "Start writing your blog...",
  readOnly = false,
  height = "100%",
  className = "",
  onFocus,
  onBlur,
  documentTitle,
  animated = false,
  magnification = 1.4,
  distance = 120,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  isStreaming = false,
  onAriScoreChange,
  disableAutoScroll = false,
  onUserScrollChange,
  titleElement,
  projectId,
}: BlogSimpleEditorProps & { ref?: React.Ref<BlogSimpleEditorRef> }) {
  // const isMobile = useMobile() // Currently unused
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  
  // Animation values for animated toolbar
  const mouseX = useMotionValue(Infinity)
  
  // Smooth scrolling state
  const [isDragging, setIsDragging] = React.useState(false)
  const [isScrollable, setIsScrollable] = React.useState(false)
  const scrollableRef = React.useRef(false)
  
  // AI state management
  const [openAI, setOpenAI] = React.useState(false)
  const [openLink, setOpenLink] = React.useState(false)

  // Track what content was last dispatched via onChange to prevent unnecessary setContent calls
  // that would clear undo history. When Accept/Reject triggers updateBlog with cleaned content,
  // the initialValue will match what editor already has, so we skip setContent.
  const lastDispatchedContentRef = React.useRef<string | null>(null)

  // Debounce onChange to avoid expensive getHTML() + downstream processing on every keystroke.
  // During streaming (agent ops), skip debounce so applyOperation gets immediate content sync.
  const onChangeDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => {
    return () => {
      if (onChangeDebounceRef.current) clearTimeout(onChangeDebounceRef.current);
    };
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: 'diff-blockquote',
          },
        },
        // Disable default codeBlock - we use CustomCodeBlock with pendingDelete/pendingInsert support
        codeBlock: false,
      }),
      // Custom CodeBlock with pendingDelete/pendingInsert attributes for AI review mode
      CustomCodeBlock,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      // Image, // Replaced by ResizableImageExtension
      ResizableImageExtension,
      Typography,
      Superscript,
      Subscript,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      CustomTable.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,

      Selection,
      SearchAndReplace,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TrailingNode,
      ReferenceManagerExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        protocols: ['http', 'https', 'ftp', 'mailto'],
      }),
      // Diff marks for version comparison
      DiffInsertion,
      DiffDeletion,
      // Version comparison extension
      VersionComparisonExtension.configure({
        onComparisonStart: () => {
          /* no-op */
        },
        onComparisonEnd: () => {
          /* no-op */
        },
      }),
      AriScoreExtension,
      // YouTube embed extension
      Youtube.configure({
        controls: true,
        nocookie: true,
        allowFullscreen: true,
        modestBranding: true,
        HTMLAttributes: {
          class: 'youtube-embed',
        },
      }),
      // Instagram embed extension
      InstagramEmbed,
      // Twitter/X embed extension
      TwitterEmbed,
    ],
    content: initialValue,
    onCreate: ({ editor }) => {
      // Calculate ARI score on initial creation
      if (onAriScoreChange && editor.storage.ariScore) {
        onAriScoreChange(editor.storage.ariScore.score);
      }
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        // During streaming/agent operations, fire immediately for content sync.
        // During normal typing, debounce 300ms to avoid expensive getHTML() + downstream
        // processing (stripDiffTags, ContentHygiene analysis, DOMParser) on every keystroke.
        if (isStreaming) {
          const html = editor.getHTML();
          lastDispatchedContentRef.current = html;
          onChange(html);
        } else {
          if (onChangeDebounceRef.current) clearTimeout(onChangeDebounceRef.current);
          onChangeDebounceRef.current = setTimeout(() => {
            const html = editor.getHTML();
            lastDispatchedContentRef.current = html;
            onChange(html);
          }, 300);
        }
      }
      if (onAriScoreChange) {
        onAriScoreChange(editor.storage.ariScore.score);
      }
    },
    // Sync table DOM attributes on any transaction (including undo/redo)
    // TipTap's TableView doesn't render pendingDelete/pendingInsert to DOM,
    // so we need to manually sync them after every transaction
    onTransaction: ({ editor, transaction }) => {
      // Check if this is an undo/redo transaction by looking for history meta
      const isUndoRedo = transaction.getMeta('history$');

      // Function to sync table DOM attributes with ProseMirror state
      // IMPORTANT: Only set attributes if not already set to avoid infinite loops
      // For undo/redo: MUST remove attributes when ProseMirror state is false
      const syncTableAttributes = () => {
        const { doc } = editor.state;
        let hasPendingTables = false;

        // Collect all tables and their pending states from ProseMirror
        doc.descendants((node, pos) => {
          if (node.type.name === 'table') {
            const { pendingDelete, pendingInsert } = node.attrs;

            // Track if we have any pending tables
            if (pendingDelete === true || pendingInsert === true) {
              hasPendingTables = true;
            }

            try {
              const domNode = editor.view.nodeDOM(pos);
              if (domNode) {
                // The DOM node might be a wrapper, find the actual table
                const tableElement = domNode instanceof HTMLTableElement
                  ? domNode
                  : (domNode as HTMLElement).querySelector?.('table') || domNode;

                if (tableElement instanceof HTMLElement) {
                  // Sync pendingDelete: ADD if true, REMOVE if false (for undo support)
                  if (pendingDelete === true && !tableElement.hasAttribute('data-pending-delete')) {
                    tableElement.setAttribute('data-pending-delete', 'true');
                    tableElement.classList.add('pending-delete-table');
                  } else if (pendingDelete !== true && tableElement.hasAttribute('data-pending-delete')) {
                    // CRITICAL: Remove attribute when ProseMirror says false (supports undo)
                    tableElement.removeAttribute('data-pending-delete');
                    tableElement.classList.remove('pending-delete-table');
                  }

                  // Sync pendingInsert: ADD if true, REMOVE if false (for undo support)
                  if (pendingInsert === true && !tableElement.hasAttribute('data-pending-insert')) {
                    tableElement.setAttribute('data-pending-insert', 'true');
                    tableElement.classList.add('pending-insert-table');
                  } else if (pendingInsert !== true && tableElement.hasAttribute('data-pending-insert')) {
                    // CRITICAL: Remove attribute when ProseMirror says false (supports undo)
                    tableElement.removeAttribute('data-pending-insert');
                    tableElement.classList.remove('pending-insert-table');
                  }
                }
              }
            } catch (e) {
              // Position might be invalid during complex transactions, ignore
            }
          }
          return true;
        });

        return hasPendingTables;
      };

      // Function to sync code block DOM attributes with ProseMirror state
      // Similar to syncTableAttributes - TipTap doesn't always render pendingInsert to DOM
      // For undo/redo: MUST remove attributes when ProseMirror state is false
      // IMPORTANT: Only set attributes if not already set to avoid infinite loops
      const syncCodeBlockAttributes = () => {
        const { doc } = editor.state;

        doc.descendants((node, pos) => {
          if (node.type.name === 'codeBlock') {
            const { pendingDelete, pendingInsert } = node.attrs;

            try {
              const domNode = editor.view.nodeDOM(pos);
              if (domNode && domNode instanceof HTMLElement) {
                const preElement = (domNode.tagName === 'PRE' ? domNode : domNode.querySelector('pre')) as HTMLElement;
                if (preElement) {
                  // Sync pendingDelete: ADD if true, REMOVE if false (for undo support)
                  if (pendingDelete === true && !preElement.hasAttribute('data-pending-delete')) {
                    preElement.setAttribute('data-pending-delete', 'true');
                    preElement.classList.add('pending-delete-codeblock');
                  } else if (pendingDelete !== true && preElement.hasAttribute('data-pending-delete')) {
                    // CRITICAL: Remove attribute when ProseMirror says false (supports undo)
                    preElement.removeAttribute('data-pending-delete');
                    preElement.classList.remove('pending-delete-codeblock');
                  }

                  // Sync pendingInsert: ADD if true, REMOVE if false (for undo support)
                  if (pendingInsert === true && !preElement.hasAttribute('data-pending-insert')) {
                    preElement.setAttribute('data-pending-insert', 'true');
                    preElement.classList.add('pending-insert-codeblock');
                  } else if (pendingInsert !== true && preElement.hasAttribute('data-pending-insert')) {
                    // CRITICAL: Remove attribute when ProseMirror says false (supports undo)
                    preElement.removeAttribute('data-pending-insert');
                    preElement.classList.remove('pending-insert-codeblock');
                  }

                }
              }
            } catch (e) {
              // Ignore errors during complex transactions
            }
          }
          return true;
        });
      };

      // Function to mark code blocks that are part of green highlighted content (new additions)
      // This is a fallback for when pendingInsert isn't set but green highlights exist
      // IMPORTANT: Only marks code blocks that are ADJACENT to green highlighted text
      // (within 50 positions before or after a green highlight)
      const syncCodeBlockGreenStyling = () => {
        const { doc } = editor.state;

        // First, collect all positions of green highlights in the document
        const greenHighlightRanges: { from: number, to: number }[] = [];
        doc.descendants((node, pos) => {
          if (node.marks && node.marks.length > 0) {
            node.marks.forEach((mark) => {
              if (mark.type.name === 'highlight') {
                const color = mark.attrs.color?.toLowerCase() || '';
                if (color.includes('c7f0d6') || color.includes('d5f6e7') || color.includes('22c55e')) {
                  greenHighlightRanges.push({ from: pos, to: pos + node.nodeSize });
                }
              }
            });
          }
          return true;
        });

        // Helper to check if a position is near a green highlight (within 50 positions)
        const isNearGreenHighlight = (codeBlockPos: number, codeBlockEnd: number) => {
          for (const range of greenHighlightRanges) {
            // Check if code block is within 50 positions before or after a green highlight
            if (codeBlockPos <= range.to + 50 && codeBlockEnd >= range.from - 50) {
              return true;
            }
          }
          return false;
        };

        // Mark code blocks that are ADJACENT to green highlights and don't have pending attributes
        doc.descendants((node, pos) => {
          if (node.type.name === 'codeBlock') {
            const { pendingDelete, pendingInsert } = node.attrs;

            // Skip if already has pending attributes (handled by syncCodeBlockAttributes)
            if (pendingDelete === true || pendingInsert === true) {
              return true;
            }

            try {
              const domNode = editor.view.nodeDOM(pos);
              if (domNode && domNode instanceof HTMLElement) {
                const preElement = (domNode.tagName === 'PRE' ? domNode : domNode.querySelector('pre')) as HTMLElement;
                if (preElement) {
                  const codeBlockEnd = pos + node.nodeSize;
                  // Only mark code blocks that are NEAR green highlighted text
                  if (isNearGreenHighlight(pos, codeBlockEnd)) {
                    preElement.setAttribute('data-new-content', 'true');
                    preElement.style.border = '2px solid #22c55e';
                    preElement.style.backgroundColor = '#D5F6E7';
                    preElement.style.borderRadius = '6px';
                    const codeEl = preElement.querySelector('code') as HTMLElement;
                    if (codeEl) {
                      codeEl.style.backgroundColor = 'transparent';
                    }
                  } else {
                    preElement.removeAttribute('data-new-content');
                    // Only clear styles if no pending attributes
                    if (!preElement.hasAttribute('data-pending-delete') && !preElement.hasAttribute('data-pending-insert')) {
                      preElement.style.border = '';
                      preElement.style.backgroundColor = '';
                      preElement.style.borderRadius = '';
                      const codeEl = preElement.querySelector('code') as HTMLElement;
                      if (codeEl) {
                        codeEl.style.backgroundColor = '';
                      }
                    }
                  }
                }
              }
            } catch (e) {
              // Ignore errors
            }
          }
          return true;
        });
      };

      // For document changes, sync multiple times to catch TipTap's delayed re-renders
      if (transaction.docChanged) {
        setTimeout(syncTableAttributes, 0);
        setTimeout(syncTableAttributes, 50);
        setTimeout(syncTableAttributes, 150);
        // Sync code block attributes (pendingInsert/pendingDelete from ProseMirror state)
        setTimeout(syncCodeBlockAttributes, 0);
        setTimeout(syncCodeBlockAttributes, 50);
        setTimeout(syncCodeBlockAttributes, 150);
        // Also sync code block green styling (fallback for green highlight detection)
        setTimeout(syncCodeBlockGreenStyling, 0);
        setTimeout(syncCodeBlockGreenStyling, 100);
        setTimeout(syncCodeBlockGreenStyling, 300);
      } else {
        // For non-document changes (selection, etc.), do a quick check and sync if needed
        // This handles the case where React re-renders cause TipTap to lose attributes
        setTimeout(() => {
          const hasPending = syncTableAttributes();
          // If we have pending tables, sync again after a delay to catch any re-renders
          if (hasPending) {
            setTimeout(syncTableAttributes, 50);
          }
          // Also sync code block attributes and styling
          syncCodeBlockAttributes();
          syncCodeBlockGreenStyling();
          setTimeout(syncCodeBlockAttributes, 100);
          setTimeout(syncCodeBlockGreenStyling, 150);
        }, 0);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // Reset AI state when user clicks elsewhere (empty selection)
      const { selection } = editor.state;
      if (selection.empty) {
        setOpenAI(false);
        // Dispatch global event to reset AI completion state
        window.dispatchEvent(new CustomEvent('ai-reset'));
      }
    },
    onFocus: () => {
      if (onFocus) onFocus();
    },
    onBlur: () => {
      if (onBlur) onBlur();
    },
    editorProps: {
      attributes: {
        autocomplete: "on",
        autocorrect: "on",
        autocapitalize: "on",
        "aria-label": "Main content area, start typing to enter text.",
        "data-streaming": String(Boolean(isStreaming)),
      },
      handleKeyDown: (view, event) => {
        // Handle Ctrl/Cmd + K for link creation
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          const { state } = view;
          const { selection } = state;

          if (!selection.empty) {
            // If there's a selection, prompt for URL and create link
            const url = window.prompt('Enter URL:');
            if (url) {
              editor?.chain().focus().setLink({ href: normalizeUrl(url), target: '_blank', rel: 'noopener noreferrer' }).run();
            }
          }
          return true;
        }
        return false;
      },
    },
  })

  // Expose methods via ref - compatible with TipTapEditorRef
  React.useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    setHTML: (html: string) => editor?.commands.setContent(html),
    clearContent: () => editor?.commands.clearContent(),
    getPlainText: () => editor?.getText() || '',
    getEditor: () => editor,
    focus: () => editor?.commands.focus(),
    blur: () => editor?.commands.blur(),
    // Sync lastDispatchedContentRef to current editor content
    // This prevents setContent from being called when updateBlog echoes back after Accept/Reject
    syncLastDispatched: () => {
      if (editor) {
        const html = editor.getHTML();
        lastDispatchedContentRef.current = html;
      }
    },
    commands: {
      compareVersion: (versionHtml: string) => editor?.commands.compareVersion(versionHtml) || false,
      showBlockDiff: (versionHtml: string) => editor?.commands.showBlockDiff(versionHtml) || false,
      exitComparison: () => editor?.commands.exitComparison() || false,
      isComparing: () => editor?.commands.isComparing() || false,
    },
  }))

  // Mobile view logic removed since highlighter was removed

  // Update editor editable state when readOnly changes
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  // Update content when initialValue changes from external source
  // Skip if the incoming initialValue matches what editor last dispatched (to preserve undo history)
  // This prevents Accept/Reject operations from clearing undo stack when updateBlog echoes back
  React.useEffect(() => {
    if (editor && initialValue !== undefined) {
      // If initialValue matches what we last dispatched, skip setContent to preserve undo history
      // This handles the case where Accept/Reject calls updateBlog with cleaned content
      // that matches what the editor already has
      if (lastDispatchedContentRef.current === initialValue) {
        return;
      }

      const currentContent = editor.getHTML();
      if (currentContent !== initialValue) {
        lastDispatchedContentRef.current = null;
        // Save scroll position before setContent
        const editorElement = editor.view.dom as HTMLElement;
        const contentWrapper = editorElement.closest('.content-wrapper') as HTMLElement;
        const savedScrollTop = contentWrapper?.scrollTop || 0;

        editor.commands.setContent(initialValue);

        // Set selection to start of document WITHOUT scrolling using direct transaction
        // This prevents cursor from being at end which causes scroll on undo
        const { tr } = editor.state;
        const newSelection = TextSelection.create(editor.state.doc, 1);
        editor.view.dispatch(tr.setSelection(newSelection).setMeta('addToHistory', false));
        editor.commands.blur();

        // Restore scroll position after content update
        if (contentWrapper) {
          requestAnimationFrame(() => {
            contentWrapper.scrollTop = savedScrollTop;
          });
        }
      } else {
        // currentContent already matches initialValue — no setContent needed
      }
    }
  }, [editor, initialValue]);

  // User scroll detection during streaming - detects when user manually scrolls away from bottom
  // Once user scrolls up, auto-scroll is disabled until they scroll back to the very bottom
  const userScrolledUpRef = React.useRef(false);
  
  React.useEffect(() => {
    if (!editor || !isStreaming) {
      // Reset scroll state when not streaming
      userScrolledUpRef.current = false;
      return;
    }
    
    const editorElement = editor.view.dom as HTMLElement;
    const contentWrapper = editorElement.closest('.content-wrapper') as HTMLElement;
    
    if (!contentWrapper) return;
    
    let lastScrollTop = contentWrapper.scrollTop;
    let lastContentHeight = contentWrapper.scrollHeight;
    
    const handleScroll = () => {
      const currentScrollTop = contentWrapper.scrollTop;
      const { scrollHeight, clientHeight } = contentWrapper;
      const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight;
      const scrollDelta = currentScrollTop - lastScrollTop;
      const contentGrew = scrollHeight > lastContentHeight;
      
      // DISABLE auto-scroll: If user scrolled UP (negative delta, not due to content growing)
      if (scrollDelta < -10 && !contentGrew) {
        // User manually scrolled upward - disable auto-scroll
        userScrolledUpRef.current = true;
        if (onUserScrollChange) {
          onUserScrollChange(true); // Notify parent: user scrolled up
        }
      }
      
      // RE-ENABLE auto-scroll: Only when user scrolls to very bottom (within 50px)
      if (distanceFromBottom <= 50 && userScrolledUpRef.current) {
        // User scrolled back to bottom - re-enable auto-scroll
        userScrolledUpRef.current = false;
        if (onUserScrollChange) {
          onUserScrollChange(false); // Notify parent: user at bottom
        }
      }
      
      lastScrollTop = currentScrollTop;
      lastContentHeight = scrollHeight;
    };
    
    // Initial state - start with auto-scroll enabled
    userScrolledUpRef.current = false;
    if (onUserScrollChange) {
      onUserScrollChange(false);
    }

    // Reset scroll to top when streaming starts so title is visible
    contentWrapper.scrollTop = 0;

    // Add scroll listener
    contentWrapper.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      contentWrapper.removeEventListener('scroll', handleScroll);
    };
  }, [editor, isStreaming, onUserScrollChange]);

  // Enhanced auto-scroll functionality for typing animations during streaming
  // Use ref to track latest disableAutoScroll value to avoid stale closures
  const disableAutoScrollRef = React.useRef(disableAutoScroll);
  React.useEffect(() => {
    disableAutoScrollRef.current = disableAutoScroll;
  }, [disableAutoScroll]);

  React.useEffect(() => {
    // Skip auto-scroll if disabled (user has scrolled up manually)
    if (disableAutoScroll) {
      return;
    }

    if (editor && initialValue !== undefined && isStreaming) {
      // Only auto-scroll when content is being streamed
      const currentContent = editor.getHTML();
      if (currentContent !== initialValue) {
        const performAutoScroll = () => {
          // Check latest value via ref to avoid stale closure
          if (disableAutoScrollRef.current) return;

          const editorElement = editor.view.dom as HTMLElement;
          const contentWrapper = editorElement.closest('.content-wrapper') as HTMLElement;

          if (contentWrapper) {
            const contentHeight = contentWrapper.scrollHeight;
            const wrapperHeight = contentWrapper.clientHeight;

            // Check if actual text content has reached the bottom of the visible area
            // This avoids scrolling too early due to editor min-height inflating scrollHeight
            try {
              const docEndPos = Math.max(editor.state.doc.content.size - 1, 0);
              const coords = editor.view.coordsAtPos(docEndPos);
              const wrapperRect = contentWrapper.getBoundingClientRect();

              // Only auto-scroll when actual streaming text reaches near the viewport bottom
              if (coords.bottom > wrapperRect.bottom - 50) {
                const currentScroll = contentWrapper.scrollTop;
                const targetScroll = contentHeight - wrapperHeight;

                if (targetScroll > currentScroll) {
                  // Smooth interpolation: scroll 15% of remaining gap each tick
                  // Creates natural flow: image+title scroll out gradually as content grows
                  const newScroll = currentScroll + (targetScroll - currentScroll) * 0.15;
                  contentWrapper.scrollTop = Math.min(Math.ceil(newScroll), targetScroll);
                }
              }
            } catch (e) {
              // Fallback: use original threshold if coordsAtPos fails
              if (contentHeight > wrapperHeight + 100) {
                const targetScroll = contentHeight - wrapperHeight;
                if (targetScroll > contentWrapper.scrollTop) {
                  contentWrapper.scrollTop = targetScroll;
                }
              }
            }
          }
        };

        // Small delay to ensure content is fully rendered, then scroll
        const timeoutId = setTimeout(() => {
          if (!disableAutoScrollRef.current) {
            performAutoScroll();
          }
        }, 50);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [editor, initialValue, isStreaming, disableAutoScroll]);

  // Update data-streaming attribute dynamically
  React.useEffect(() => {
    if (editor?.view?.dom) {
      editor.view.dom.setAttribute('data-streaming', String(Boolean(isStreaming)));
    }
  }, [editor, isStreaming]);

  // No longer need highlight cleanup since AI doesn't use highlights

  // Link preview preloading removed

  // Enhanced smooth scrolling functionality with better button interaction
  React.useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    // Check if toolbar is scrollable
    const checkScrollable = () => {
      const isScrollableNow = toolbar.scrollWidth > toolbar.clientWidth;
      setIsScrollable(isScrollableNow);
      scrollableRef.current = isScrollableNow;
    };

    // Initial check and resize observer
    checkScrollable();
    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(toolbar);

    // Separate mouse tracking for animations (doesn't interfere with scrolling)
    const handleMouseMoveForAnimation = (e: MouseEvent) => {
      if (animated && !isDragging) {
        mouseX.set(e.pageX);
      }
    };

    const handleMouseLeaveForAnimation = () => {
      if (animated) {
        mouseX.set(Infinity);
      }
    };

    // Enhanced wheel scrolling (trackpad/mouse wheel) - works everywhere
    const handleWheel = (e: WheelEvent) => {
      if (!scrollableRef.current) return;
      
      // Only prevent default if we're actually scrolling
      let scrollAmount = 0;
      
      // Handle horizontal scrolling (trackpad gesture or shift+wheel)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        scrollAmount = e.deltaX || e.deltaY;
      } else {
        // Vertical scroll becomes horizontal (more intuitive)
        scrollAmount = e.deltaY * 0.5; // Reduce sensitivity
      }
      
      if (Math.abs(scrollAmount) > 1) {
        e.preventDefault();
        
        // Apply smooth scrolling with easing
        const targetScroll = toolbar.scrollLeft + scrollAmount;
        const clampedScroll = Math.max(0, Math.min(targetScroll, toolbar.scrollWidth - toolbar.clientWidth));
        
        // Use requestAnimationFrame for smooth scrolling
        let currentScroll = toolbar.scrollLeft;
        const scrollDiff = clampedScroll - currentScroll;
        const startTime = performance.now();
        const duration = 150; // 150ms animation
        
        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (ease-out)
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          toolbar.scrollLeft = currentScroll + (scrollDiff * easeOut);
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };
        
        requestAnimationFrame(animateScroll);
      }
    };

    // Drag scrolling state
    let dragState = {
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
      startTime: 0,
      lastX: 0,
      velocity: 0,
      animationId: 0
    };

    // Momentum scrolling
    const momentumScroll = () => {
      if (Math.abs(dragState.velocity) > 0.5) {
        const newScrollLeft = toolbar.scrollLeft + dragState.velocity;
        const clampedScroll = Math.max(0, Math.min(newScrollLeft, toolbar.scrollWidth - toolbar.clientWidth));
        toolbar.scrollLeft = clampedScroll;
        dragState.velocity *= 0.95; // Decay factor
        dragState.animationId = requestAnimationFrame(momentumScroll);
      } else {
        dragState.velocity = 0;
      }
    };

    // Improved drag detection - only on spacer areas
    const handleMouseDown = (e: MouseEvent) => {
      if (!scrollableRef.current) return;
      
      const target = e.target as HTMLElement;
      
      // Only allow dragging on spacer elements or empty toolbar areas
      const isDragArea = target.classList.contains('tiptap-spacer') || 
                         target === toolbar ||
                         target.classList.contains('tiptap-toolbar');
      
      if (!isDragArea) return;

      dragState.isDragging = true;
      dragState.startX = e.pageX;
      dragState.scrollLeft = toolbar.scrollLeft;
      dragState.startTime = performance.now();
      dragState.lastX = e.pageX;
      dragState.velocity = 0;
      
      setIsDragging(true);
      
      // Cancel any ongoing momentum
      if (dragState.animationId) {
        cancelAnimationFrame(dragState.animationId);
      }
      
      e.preventDefault();
    };

    // Global mouse move for dragging
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !scrollableRef.current) return;
      
      e.preventDefault();
      
      const deltaX = e.pageX - dragState.startX;
      const newScrollLeft = dragState.scrollLeft - deltaX;
      
      // Calculate velocity for momentum
      const currentTime = performance.now();
      const timeDiff = currentTime - dragState.startTime;
      if (timeDiff > 0) {
        dragState.velocity = (e.pageX - dragState.lastX) * -0.3;
      }
      dragState.lastX = e.pageX;
      
      // Apply scroll with bounds
      const clampedScroll = Math.max(0, Math.min(newScrollLeft, toolbar.scrollWidth - toolbar.clientWidth));
      toolbar.scrollLeft = clampedScroll;
    };

    // Global mouse up
    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        dragState.isDragging = false;
        setIsDragging(false);
        
        // Start momentum if there's enough velocity
        if (Math.abs(dragState.velocity) > 1) {
          momentumScroll();
        }
      }
    };

    // Touch events for mobile
    let touchState = { 
      isTouch: false, 
      startX: 0, 
      scrollLeft: 0,
      lastX: 0,
      velocity: 0
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (!scrollableRef.current) return;
      
      const touch = e.touches[0];
      touchState.isTouch = true;
      touchState.startX = touch.pageX;
      touchState.scrollLeft = toolbar.scrollLeft;
      touchState.lastX = touch.pageX;
      touchState.velocity = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchState.isTouch || !scrollableRef.current) return;
      
      const touch = e.touches[0];
      const deltaX = touch.pageX - touchState.startX;
      const newScrollLeft = touchState.scrollLeft - deltaX;
      
      // Calculate velocity
      touchState.velocity = (touch.pageX - touchState.lastX) * -0.5;
      touchState.lastX = touch.pageX;
      
      const clampedScroll = Math.max(0, Math.min(newScrollLeft, toolbar.scrollWidth - toolbar.clientWidth));
      toolbar.scrollLeft = clampedScroll;
      
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      touchState.isTouch = false;
    };

    // Add event listeners
    toolbar.addEventListener('mousedown', handleMouseDown);
    toolbar.addEventListener('mousemove', handleMouseMoveForAnimation);
    toolbar.addEventListener('mouseleave', handleMouseLeaveForAnimation);
    toolbar.addEventListener('wheel', handleWheel, { passive: false });
    toolbar.addEventListener('touchstart', handleTouchStart, { passive: false });
    toolbar.addEventListener('touchmove', handleTouchMove, { passive: false });
    toolbar.addEventListener('touchend', handleTouchEnd);
    
    // Global mouse events for dragging
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      if (dragState.animationId) {
        cancelAnimationFrame(dragState.animationId);
      }
      toolbar.removeEventListener('mousedown', handleMouseDown);
      toolbar.removeEventListener('mousemove', handleMouseMoveForAnimation);
      toolbar.removeEventListener('mouseleave', handleMouseLeaveForAnimation);
      toolbar.removeEventListener('wheel', handleWheel);
      toolbar.removeEventListener('touchstart', handleTouchStart);
      toolbar.removeEventListener('touchmove', handleTouchMove);
      toolbar.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      resizeObserver.disconnect();
    };
  }, [animated, mouseX, isDragging]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <div 
        className={`blog-simple-editor-container ${className}`}
        style={{ height }}
      >

        {/* AI-powered text selection bubble menu - disabled in read-only mode */}
        {editor && (
          <div style={{ display: readOnly ? 'none' : 'contents' }}>
            <GenerativeMenuSwitch
              editor={editor}
              open={openAI}
              onOpenChange={setOpenAI}
              openLink={openLink}
              onOpenLinkChange={setOpenLink}
            >
              <TextButtons editor={editor} openLink={openLink} onOpenLinkChange={setOpenLink} />
            </GenerativeMenuSwitch>
          </div>
        )}

        {/* Link edit bubble menu - disabled in read-only mode */}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              duration: 100,
              placement: 'bottom',
              maxWidth: 'none',
            }}
            shouldShow={({ editor }) => {
              if (readOnly) return false;
              // Show when cursor is on a link (empty or selected — link click handler selects text)
              return editor.isActive('link');
            }}
            className="link-edit-bubble-menu"
          >
            <LinkEditBubble editor={editor} />
          </BubbleMenu>
        )}

        {/* Table bubble menu - disabled in read-only mode */}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              duration: 100,
              placement: 'top',
              maxWidth: 'none',
            }}
            shouldShow={({ editor }) => {
              if (readOnly) return false;
              // Only show when inside a table
              if (!editor.isActive('table')) return false;

              // Hide bubble menu for tables with pending attributes (AI review mode)
              // During table replacement, both red and green tables should have no bubble menu
              const { selection } = editor.state;
              const { $from } = selection;
              for (let d = $from.depth; d > 0; d--) {
                const node = $from.node(d);
                if (node.type.name === 'table') {
                  if (node.attrs.pendingDelete || node.attrs.pendingInsert) {
                    return false; // Hide bubble for pending tables
                  }
                  break;
                }
              }
              return true;
            }}
            className="table-bubble-menu"
          >
            <TableBubble editor={editor} />
          </BubbleMenu>
        )}


        <div
          className="content-wrapper"
          data-streaming={String(Boolean(isStreaming))}
        >
          {titleElement}
          <div style={{ position: 'relative' }}>
            <EditorContent
              editor={editor}
              role="presentation"
              className="simple-editor-content"
            />
            {placeholder && !editor?.getText() && (
              <div className="blog-editor-placeholder">{placeholder}</div>
            )}
          </div>
        </div>

        {/* Toolbar - hidden in read-only mode with slide-out animation */}
        {!readOnly && React.createElement(animated ? AnimatedToolbar : Toolbar, {
          ref: toolbarRef,
          variant: "floating" as const,
          className: `tiptap-toolbar ${isDragging ? 'is-dragging' : ''}`,
          style: {
            position: 'relative',
            bottom: 'auto',
            left: 'auto',
            right: 'auto',
            zIndex: 10,
            minHeight: '44px',
            background: 'var(--tt-toolbar-bg-color)',
            borderTop: '1px solid var(--tt-toolbar-border-color)',
            borderRadius: 0,
            boxShadow: 'none',
            margin: 0,
            padding: '0 0.5rem',
            overflowX: isScrollable ? 'auto' : 'visible',
            overflowY: 'visible',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: isScrollable ? (isDragging ? 'grabbing' : 'grab') : 'default',
            userSelect: isDragging ? 'none' : 'auto',
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
            transform: 'translateY(0)',
            opacity: 1
          },
          ...(animated && {
            magnification,
            distance,
            spring
          })
        }, React.createElement(MainToolbarContent, {
          animated,
          mouseX,
          spring,
          distance,
          magnification,
          isScrollable,
          editor,
          documentTitle,
          projectId,
        }))}
      </div>
    </EditorContext.Provider>
  )
}
