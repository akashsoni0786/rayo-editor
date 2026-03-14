import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import { useMotionValue } from "framer-motion"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"

// --- Custom Extensions ---
import { Link } from "../../tiptap-extension/link-extension"
import { Selection } from "../../tiptap-extension/selection-extension"
import { TrailingNode } from "../../tiptap-extension/trailing-node-extension"

// --- UI Primitives ---
import { Button } from "../../tiptap-ui-primitive/button"
import { Spacer } from "../../tiptap-ui-primitive/spacer"
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

// --- Tiptap Node ---
import { ImageUploadNode } from "../../tiptap-node/image-upload-node/image-upload-node-extension"
import "../../tiptap-node/code-block-node/code-block-node.scss"
import "../../tiptap-node/list-node/list-node.scss"
import "../../tiptap-node/image-node/image-node.scss"
import "../../tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "../../tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "../../tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "../../tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "../../tiptap-ui/blockquote-button"
import { CodeBlockButton } from "../../tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "../../tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "../../tiptap-ui/link-popover"
import { MarkButton } from "../../tiptap-ui/mark-button"
import { TextAlignButton } from "../../tiptap-ui/text-align-button"
import { UndoRedoButton } from "../../tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "../../tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "../../tiptap-icons/highlighter-icon"
import { LinkIcon } from "../../tiptap-icons/link-icon"

// --- Hooks ---
import { useMobile } from "../../../hooks/use-mobile"

// --- Components ---

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "../../../lib/tiptap-utils"

// --- Styles ---
import "./simple-editor.scss"
import "../../tiptap-ui-primitive/toolbar/animated-toolbar.scss"

import content from "./data/content.json"

interface SimpleEditorProps {
  animated?: boolean
  magnification?: number
  distance?: number
  spring?: {
    mass: number
    stiffness: number
    damping: number
  }
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  animated = false,
  mouseX,
  spring,
  distance,
  magnification,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  animated?: boolean
  mouseX?: any
  spring?: any
  distance?: number
  magnification?: number
}) => {
  const Group = animated ? AnimatedToolbarGroup : ToolbarGroup
  const Separator = animated ? AnimatedToolbarSeparator : ToolbarSeparator
  return (
    <>
      <Spacer />

      <Group
        {...(animated && {
          mouseX,
          spring,
          distance,
          magnification
        })}
      >
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
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
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <BlockquoteButton />
        <CodeBlockButton />
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
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
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
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
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
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
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
        <ImageUploadButton text="Add" />
      </Group>

      <Spacer />

      {isMobile && <Separator />}

    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
  animated = false,
  mouseX,
  spring,
  distance,
  magnification,
}: {
  type: "highlighter" | "link"
  onBack: () => void
  animated?: boolean
  mouseX?: any
  spring?: any
  distance?: number
  magnification?: number
}) => {
  const Group = animated ? AnimatedToolbarGroup : ToolbarGroup
  const Separator = animated ? AnimatedToolbarSeparator : ToolbarSeparator
  
  return (
    <>
      <Group
        {...(animated && {
          mouseX,
          spring,
          distance,
          magnification
        })}
      >
        <Button data-style="ghost" onClick={onBack}>
          <ArrowLeftIcon className="tiptap-button-icon" />
          {type === "highlighter" ? (
            <HighlighterIcon className="tiptap-button-icon" />
          ) : (
            <LinkIcon className="tiptap-button-icon" />
          )}
        </Button>
      </Group>

      <Separator />

      {type === "highlighter" ? (
        <ColorHighlightPopoverContent />
      ) : (
        <LinkContent />
      )}
    </>
  )
}

export function SimpleEditor({
  animated = false,
  magnification = 1.4,
  distance = 120,
  spring = { mass: 0.1, stiffness: 150, damping: 12 }
}: SimpleEditorProps = {}) {
  const isMobile = useMobile()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  
  // Animation values for animated toolbar
  const mouseX = useMotionValue(Infinity)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "on",
        autocorrect: "on",
        autocapitalize: "on",
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,

      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
    ],
    content: content,
  })


  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  const ToolbarComponent = animated ? AnimatedToolbar : Toolbar

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="simple-editor-container">
        <div className="content-wrapper">
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </div>
        
        <ToolbarComponent
          ref={toolbarRef}
          variant="fixed"
          {...(animated && {
            magnification,
            distance,
            spring,
            onMouseMove: ({ pageX }: { pageX: number }) => mouseX.set(pageX),
            onMouseLeave: () => mouseX.set(Infinity)
          })}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              animated={animated}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
              animated={animated}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
            />
          )}
        </ToolbarComponent>
      </div>
    </EditorContext.Provider>
  )
}
