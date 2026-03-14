import * as React from "react"
import type { Placement } from "@floating-ui/react"
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from "@floating-ui/react"
import "@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss"
import { Separator } from "@/components/tiptap-ui-primitive/separator"

interface DropdownMenuOptions {
  initialOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

interface DropdownMenuProps extends DropdownMenuOptions {
  children: React.ReactNode
}

type ContextType = ReturnType<typeof useDropdownMenu> & {
  updatePosition: (
    side: "top" | "right" | "bottom" | "left",
    align: "start" | "center" | "end"
  ) => void
}

const DropdownMenuContext = React.createContext<ContextType | null>(null)

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error(
      "DropdownMenu components must be wrapped in <DropdownMenu />"
    )
  }
  return context
}

function useDropdownMenu({
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  side = "bottom",
  align = "start",
}: DropdownMenuOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen)
  const [currentPlacement, setCurrentPlacement] = React.useState<Placement>(
    `${side}-${align}` as Placement
  )
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const elementsRef = React.useRef<Array<HTMLElement | null>>([])
  const labelsRef = React.useRef<Array<string | null>>([])

  const floating = useFloating({
    open,
    onOpenChange: setOpen,
    placement: currentPlacement,
    middleware: [offset({ mainAxis: 4 }), flip(), shift({ padding: 4 })],
    whileElementsMounted: autoUpdate,
  })

  const { context } = floating

  const interactions = useInteractions([
    useClick(context, {
      event: "mousedown",
      toggle: true,
      ignoreMouse: false,
    }),
    useRole(context, { role: "menu" }),
    useDismiss(context, {
      outsidePress: true,
      outsidePressEvent: "mousedown",
    }),
    useListNavigation(context, {
      listRef: elementsRef,
      activeIndex,
      onNavigate: setActiveIndex,
      loop: true,
    }),
    useTypeahead(context, {
      listRef: labelsRef,
      onMatch: open ? setActiveIndex : undefined,
      activeIndex,
    }),
  ])

  const updatePosition = React.useCallback(
    (
      newSide: "top" | "right" | "bottom" | "left",
      newAlign: "start" | "center" | "end"
    ) => {
      setCurrentPlacement(`${newSide}-${newAlign}` as Placement)
    },
    []
  )

  return React.useMemo(
    () => ({
      open,
      setOpen,
      activeIndex,
      setActiveIndex,
      elementsRef,
      labelsRef,
      updatePosition,
      ...interactions,
      ...floating,
    }),
    [open, setOpen, activeIndex, interactions, floating, updatePosition]
  )
}

export function DropdownMenu({ children, ...options }: DropdownMenuProps) {
  const dropdown = useDropdownMenu(options)
  return (
    <DropdownMenuContext.Provider value={dropdown}>
      <FloatingList
        elementsRef={dropdown.elementsRef}
        labelsRef={dropdown.labelsRef}
      >
        {children}
      </FloatingList>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function DropdownMenuTrigger({
  children,
  asChild = false,
  ref: propRef,
  ...props
}: DropdownMenuTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const context = useDropdownMenuContext()
  const childrenRef = React.isValidElement(children)
    ? parseInt(React.version, 10) >= 19
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (children as { props: { ref?: React.Ref<any> } }).props.ref
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (children as any).ref
    : undefined
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

  if (asChild && React.isValidElement(children)) {
    const dataAttributes = {
      "data-state": context.open ? "open" : "closed",
    }

    return React.cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...(typeof children.props === "object" ? children.props : {}),
        "aria-expanded": context.open,
        "aria-haspopup": "menu" as const,
        ...dataAttributes,
      })
    )
  }

  return (
    <button
      ref={ref}
      aria-expanded={context.open}
      aria-haspopup="menu"
      data-state={context.open ? "open" : "closed"}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  portal?: boolean
  portalProps?: Omit<React.ComponentProps<typeof FloatingPortal>, "children">
}

export function DropdownMenuContent({
  style,
  className,
  orientation = "vertical",
  side = "bottom",
  align = "start",
  portal = true,
  portalProps = {},
  ref: propRef,
  ...props
}: DropdownMenuContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const context = useDropdownMenuContext()
  const ref = useMergeRefs([context.refs.setFloating, propRef])

  React.useEffect(() => {
    context.updatePosition(side, align)
  }, [context, side, align])

  if (!context.open) return null

  const content = (
    <FloatingFocusManager
      context={context.context}
      modal={false}
      initialFocus={0}
      returnFocus={true}
    >
      <div
        ref={ref}
        className={`tiptap-dropdown-menu ${className || ""}`}
        style={{
          position: context.strategy,
          top: context.y ?? 0,
          left: context.x ?? 0,
          outline: "none",
          ...style,
        }}
        aria-orientation={orientation}
        data-orientation={orientation}
        data-state={context.open ? "open" : "closed"}
        data-side={side}
        data-align={align}
        {...context.getFloatingProps(props)}
      >
        {props.children}
      </div>
    </FloatingFocusManager>
  )

  if (portal) {
    return <FloatingPortal {...portalProps}>{content}</FloatingPortal>
  }

  return content
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  disabled?: boolean
  onSelect?: () => void
}

export function DropdownMenuItem({
  children,
  disabled,
  asChild = false,
  onSelect,
  className,
  ref,
  ...props
}: DropdownMenuItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const context = useDropdownMenuContext()
  const item = useListItem({ label: disabled ? null : children?.toString() })
  const isActive = context.activeIndex === item.index

  const handleSelect = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onSelect?.()
      props.onClick?.(event)
      context.setOpen(false)
    },
    [context, disabled, onSelect, props]
  )

  const itemProps: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.Ref<HTMLDivElement>
    role: string
    tabIndex: number
    "aria-disabled"?: boolean
    "data-highlighted"?: boolean
  } = {
    ref: useMergeRefs([item.ref, ref]),
    role: "menuitem",
    className,
    tabIndex: isActive ? 0 : -1,
    "data-highlighted": isActive,
    "aria-disabled": disabled,
    ...context.getItemProps({
      ...props,
      onClick: handleSelect,
    }),
  }

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as {
      onClick?: (event: React.MouseEvent<HTMLElement>) => void
    }

    // Create merged props without adding onClick directly to the props object
    const mergedProps = {
      ...itemProps,
      ...(typeof children.props === "object" ? children.props : {}),
    }

    // Handle onClick separately based on the element type
    const eventHandlers = {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        // Cast the event to make it compatible with handleSelect
        handleSelect(event as unknown as React.MouseEvent<HTMLDivElement>)
        childProps.onClick?.(event)
      },
    }

    return React.cloneElement(children, {
      ...mergedProps,
      ...eventHandlers,
    })
  }

  return <div {...itemProps}>{children}</div>
}

interface DropdownMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
}

export function DropdownMenuGroup({
  children,
  label,
  className,
  ref,
  ...props
}: DropdownMenuGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      {...props}
      ref={ref}
      role="group"
      aria-label={label}
      className={`tiptap-button-group ${className || ""}`}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof Separator> & { ref?: React.Ref<React.ElementRef<typeof Separator>> }) {
  return (
    <Separator
      ref={ref}
      className={`tiptap-dropdown-menu-separator ${className || ""}`}
      {...props}
    />
  )
}
