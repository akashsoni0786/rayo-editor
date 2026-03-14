"use client"

import * as React from "react"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import "@/components/tiptap-ui-primitive/toolbar/toolbar.scss"

type BaseProps = React.HTMLAttributes<HTMLDivElement>

interface ToolbarProps extends BaseProps {
  variant?: "floating" | "fixed"
}

const mergeRefs = <T,>(
  refs: Array<React.RefObject<T> | React.Ref<T> | null | undefined>
): React.RefCallback<T> => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

const useObserveVisibility = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
): void => {
  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    let isMounted = true

    if (isMounted) {
      requestAnimationFrame(callback)
    }

    const observer = new MutationObserver(() => {
      if (isMounted) {
        requestAnimationFrame(callback)
      }
    })

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      isMounted = false
      observer.disconnect()
    }
  }, [ref, callback])
}

const useToolbarKeyboardNav = (
  toolbarRef: React.RefObject<HTMLDivElement | null>
): void => {
  React.useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const getFocusableElements = () =>
      Array.from(
        toolbar.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])'
        )
      )

    const navigateToIndex = (
      e: KeyboardEvent,
      targetIndex: number,
      elements: HTMLElement[]
    ) => {
      e.preventDefault()
      let nextIndex = targetIndex

      if (nextIndex >= elements.length) {
        nextIndex = 0
      } else if (nextIndex < 0) {
        nextIndex = elements.length - 1
      }

      elements[nextIndex]?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableElements = getFocusableElements()
      if (!focusableElements.length) return

      const currentElement = document.activeElement as HTMLElement
      const currentIndex = focusableElements.indexOf(currentElement)

      if (!toolbar.contains(currentElement)) return

      const keyActions: Record<string, () => void> = {
        ArrowRight: () =>
          navigateToIndex(e, currentIndex + 1, focusableElements),
        ArrowDown: () =>
          navigateToIndex(e, currentIndex + 1, focusableElements),
        ArrowLeft: () =>
          navigateToIndex(e, currentIndex - 1, focusableElements),
        ArrowUp: () => navigateToIndex(e, currentIndex - 1, focusableElements),
        Home: () => navigateToIndex(e, 0, focusableElements),
        End: () =>
          navigateToIndex(e, focusableElements.length - 1, focusableElements),
      }

      const action = keyActions[e.key]
      if (action) {
        action()
      }
    }

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (toolbar.contains(target)) {
        target.setAttribute("data-focus-visible", "true")
      }
    }

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (toolbar.contains(target)) {
        target.removeAttribute("data-focus-visible")
      }
    }

    toolbar.addEventListener("keydown", handleKeyDown)
    toolbar.addEventListener("focus", handleFocus, true)
    toolbar.addEventListener("blur", handleBlur, true)

    const focusableElements = getFocusableElements()
    focusableElements.forEach((element) => {
      element.addEventListener("focus", handleFocus)
      element.addEventListener("blur", handleBlur)
    })

    return () => {
      toolbar.removeEventListener("keydown", handleKeyDown)
      toolbar.removeEventListener("focus", handleFocus, true)
      toolbar.removeEventListener("blur", handleBlur, true)

      const focusableElements = getFocusableElements()
      focusableElements.forEach((element) => {
        element.removeEventListener("focus", handleFocus)
        element.removeEventListener("blur", handleBlur)
      })
    }
  }, [toolbarRef])
}

const useToolbarVisibility = (
  ref: React.RefObject<HTMLDivElement | null>
): boolean => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const toolbar = ref.current
    if (!toolbar) return

    // Check if any group has visible children
    const hasVisibleChildren = Array.from(toolbar.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false
      if (child.getAttribute("role") === "group") {
        return child.children.length > 0
      }
      return false
    })

    setIsVisible(hasVisibleChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

const useGroupVisibility = (
  ref: React.RefObject<HTMLDivElement | null>
): boolean => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const group = ref.current
    if (!group) return

    const hasVisibleChildren = Array.from(group.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false
      return true
    })

    setIsVisible(hasVisibleChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

const useSeparatorVisibility = (
  ref: React.RefObject<HTMLDivElement | null>
): boolean => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const separator = ref.current
    if (!separator) return

    const prevSibling = separator.previousElementSibling as HTMLElement
    const nextSibling = separator.nextElementSibling as HTMLElement

    if (!prevSibling || !nextSibling) {
      setIsVisible(false)
      return
    }

    const areBothGroups =
      prevSibling.getAttribute("role") === "group" &&
      nextSibling.getAttribute("role") === "group"

    const haveBothChildren =
      prevSibling.children.length > 0 && nextSibling.children.length > 0

    setIsVisible(areBothGroups && haveBothChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

export function Toolbar({
  children,
  className,
  variant = "fixed",
  ref,
  ...props
}: ToolbarProps & { ref?: React.Ref<HTMLDivElement> }) {
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const isVisible = useToolbarVisibility(toolbarRef)
  const [isDragging, setIsDragging] = React.useState(false)
  const [scrollPosition, setScrollPosition] = React.useState(0)
  const dragStateRef = React.useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0
  })

  useToolbarKeyboardNav(toolbarRef)

  // Add draggable functionality
  React.useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const handleMouseDown = (e: MouseEvent) => {
      // Only allow dragging on the toolbar background, not on buttons
      if ((e.target as HTMLElement).closest('button, .tiptap-button, [role="button"]')) {
        return
      }

      dragStateRef.current = {
        isDragging: true,
        startX: e.pageX - toolbar.offsetLeft,
        scrollLeft: toolbar.scrollLeft
      }
      setIsDragging(true)
      e.preventDefault()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return
      e.preventDefault()

      const x = e.pageX - toolbar.offsetLeft
      const walk = (x - dragStateRef.current.startX) * 1.5 // Scroll speed
      const newScrollLeft = dragStateRef.current.scrollLeft - walk

      toolbar.scrollLeft = Math.max(0, Math.min(newScrollLeft, toolbar.scrollWidth - toolbar.clientWidth))
      setScrollPosition(toolbar.scrollLeft)
    }

    const handleMouseUp = () => {
      dragStateRef.current.isDragging = false
      setIsDragging(false)
    }

    const handleMouseLeave = () => {
      dragStateRef.current.isDragging = false
      setIsDragging(false)
    }

    toolbar.addEventListener('mousedown', handleMouseDown)
    toolbar.addEventListener('mousemove', handleMouseMove)
    toolbar.addEventListener('mouseup', handleMouseUp)
    toolbar.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      toolbar.removeEventListener('mousedown', handleMouseDown)
      toolbar.removeEventListener('mousemove', handleMouseMove)
      toolbar.removeEventListener('mouseup', handleMouseUp)
      toolbar.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      ref={mergeRefs([toolbarRef, ref])}
      role="toolbar"
      aria-label="toolbar"
      data-variant={variant}
      className={`tiptap-toolbar ${className || ""} ${isDragging ? 'is-dragging' : ''}`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: isDragging ? 'none' : 'auto',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function ToolbarGroup({
  children,
  className,
  ref,
  ...props
}: BaseProps & { ref?: React.Ref<HTMLDivElement> }) {
  const groupRef = React.useRef<HTMLDivElement>(null)
  const isVisible = useGroupVisibility(groupRef)

  if (!isVisible) return null

  return (
    <div
      ref={mergeRefs([groupRef, ref])}
      role="group"
      className={`tiptap-toolbar-group ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function ToolbarSeparator({
  ref,
  ...props
}: BaseProps & { ref?: React.Ref<HTMLDivElement> }) {
  const separatorRef = React.useRef<HTMLDivElement>(null)
  const isVisible = useSeparatorVisibility(separatorRef)

  if (!isVisible) return null

  return (
    <Separator
      ref={mergeRefs([separatorRef, ref])}
      orientation="vertical"
      decorative
      {...props}
    />
  )
}
