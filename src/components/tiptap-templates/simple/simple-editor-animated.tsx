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

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  mouseX,
  spring,
  distance,
  magnification,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  mouseX?: any
  spring?: any
  distance?: number
  magnification?: number
}) => {
  return (
    <>
      <Spacer />

      <AnimatedToolbarGroup
        mouseX={mouseX}
        spring={spring}
        distance={distance}
        magnification={magnification}
      >
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </AnimatedToolbarGroup>

      <AnimatedToolbarSeparator />

      <AnimatedToolbarGroup
        mouseX={mouseX}
        spring={spring}
        distance={distance}
        magnification={magnification}
      >
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <BlockquoteButton />
        <CodeBlockButton />
      </AnimatedToolbarGroup>

      <AnimatedToolbarSeparator />

      <AnimatedToolbarGroup
        mouseX={mouseX}
        spring={spring}
        distance={distance}
        magnification={magnification}
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
      </AnimatedToolbarGroup>

      <AnimatedToolbarSeparator />

      <AnimatedToolbarGroup
        mouseX={mouseX}
        spring={spring}
        distance={distance}
        magnification={magnification}
      >
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </AnimatedToolbarGroup>

      <AnimatedToolbarSeparator />

      <AnimatedToolbarGroup
        mouseX={mouseX}
        spring={spring}
        distance={distance}
        magnification={magnification}
      >
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </AnimatedToolbarGroup>

      <AnimatedToolbarSeparator />

      <AnimatedToolbarGroup
        mouseX={mouseX}
        spring={spring}
        distance={distance}
        magnification={magnification}
      >
        <ImageUploadButton text="Add" />
      </AnimatedToolbarGroup>

      <Spacer />

      {isMobile && <AnimatedToolbarSeparator />}

    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
  mouseX,
  spring,
  distance,
  magnification,
}: {
  type: "highlighter" | "link"
  onBack: () => void
  mouseX?: any
  spring?: any
  distance?: number
  magnification?: number
}) => (
  <>
    <AnimatedToolbarGroup
      mouseX={mouseX}
      spring={spring}
      distance={distance}
      magnification={magnification}
    >
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </AnimatedToolbarGroup>

    <AnimatedToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditorAnimated() {
  const isMobile = useMobile()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  
  // Animation settings
  const mouseX = useMotionValue(Infinity)
  const spring = { mass: 0.1, stiffness: 150, damping: 12 }
  const distance = 120
  const magnification = 1.4

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
        
        <AnimatedToolbar
          ref={toolbarRef}
          variant="fixed"
          magnification={magnification}
          distance={distance}
          spring={spring}
          onMouseMove={({ pageX }) => mouseX.set(pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
            />
          )}
        </AnimatedToolbar>
      </div>
    </EditorContext.Provider>
  )
}