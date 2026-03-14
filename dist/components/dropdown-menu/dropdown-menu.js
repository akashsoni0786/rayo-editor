import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { autoUpdate, flip, FloatingFocusManager, FloatingList, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useListItem, useListNavigation, useMergeRefs, useRole, useTypeahead, } from "@floating-ui/react";
import "@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss";
import { Separator } from "@/components/tiptap-ui-primitive/separator";
const DropdownMenuContext = React.createContext(null);
function useDropdownMenuContext() {
    const context = React.useContext(DropdownMenuContext);
    if (!context) {
        throw new Error("DropdownMenu components must be wrapped in <DropdownMenu />");
    }
    return context;
}
function useDropdownMenu({ initialOpen = false, open: controlledOpen, onOpenChange: setControlledOpen, side = "bottom", align = "start", }) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
    const [currentPlacement, setCurrentPlacement] = React.useState(`${side}-${align}`);
    const [activeIndex, setActiveIndex] = React.useState(null);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;
    const elementsRef = React.useRef([]);
    const labelsRef = React.useRef([]);
    const floating = useFloating({
        open,
        onOpenChange: setOpen,
        placement: currentPlacement,
        middleware: [offset({ mainAxis: 4 }), flip(), shift({ padding: 4 })],
        whileElementsMounted: autoUpdate,
    });
    const { context } = floating;
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
    ]);
    const updatePosition = React.useCallback((newSide, newAlign) => {
        setCurrentPlacement(`${newSide}-${newAlign}`);
    }, []);
    return React.useMemo(() => ({
        open,
        setOpen,
        activeIndex,
        setActiveIndex,
        elementsRef,
        labelsRef,
        updatePosition,
        ...interactions,
        ...floating,
    }), [open, setOpen, activeIndex, interactions, floating, updatePosition]);
}
export function DropdownMenu({ children, ...options }) {
    const dropdown = useDropdownMenu(options);
    return (_jsx(DropdownMenuContext.Provider, { value: dropdown, children: _jsx(FloatingList, { elementsRef: dropdown.elementsRef, labelsRef: dropdown.labelsRef, children: children }) }));
}
export function DropdownMenuTrigger({ children, asChild = false, ref: propRef, ...props }) {
    const context = useDropdownMenuContext();
    const childrenRef = React.isValidElement(children)
        ? parseInt(React.version, 10) >= 19
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                children.props.ref
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                children.ref
        : undefined;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);
    if (asChild && React.isValidElement(children)) {
        const dataAttributes = {
            "data-state": context.open ? "open" : "closed",
        };
        return React.cloneElement(children, context.getReferenceProps({
            ref,
            ...props,
            ...(typeof children.props === "object" ? children.props : {}),
            "aria-expanded": context.open,
            "aria-haspopup": "menu",
            ...dataAttributes,
        }));
    }
    return (_jsx("button", { ref: ref, "aria-expanded": context.open, "aria-haspopup": "menu", "data-state": context.open ? "open" : "closed", ...context.getReferenceProps(props), children: children }));
}
export function DropdownMenuContent({ style, className, orientation = "vertical", side = "bottom", align = "start", portal = true, portalProps = {}, ref: propRef, ...props }) {
    const context = useDropdownMenuContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);
    React.useEffect(() => {
        context.updatePosition(side, align);
    }, [context, side, align]);
    if (!context.open)
        return null;
    const content = (_jsx(FloatingFocusManager, { context: context.context, modal: false, initialFocus: 0, returnFocus: true, children: _jsx("div", { ref: ref, className: `tiptap-dropdown-menu ${className || ""}`, style: {
                position: context.strategy,
                top: context.y ?? 0,
                left: context.x ?? 0,
                outline: "none",
                ...style,
            }, "aria-orientation": orientation, "data-orientation": orientation, "data-state": context.open ? "open" : "closed", "data-side": side, "data-align": align, ...context.getFloatingProps(props), children: props.children }) }));
    if (portal) {
        return _jsx(FloatingPortal, { ...portalProps, children: content });
    }
    return content;
}
export function DropdownMenuItem({ children, disabled, asChild = false, onSelect, className, ref, ...props }) {
    const context = useDropdownMenuContext();
    const item = useListItem({ label: disabled ? null : children?.toString() });
    const isActive = context.activeIndex === item.index;
    const handleSelect = React.useCallback((event) => {
        if (disabled)
            return;
        onSelect?.();
        props.onClick?.(event);
        context.setOpen(false);
    }, [context, disabled, onSelect, props]);
    const itemProps = {
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
    };
    if (asChild && React.isValidElement(children)) {
        const childProps = children.props;
        // Create merged props without adding onClick directly to the props object
        const mergedProps = {
            ...itemProps,
            ...(typeof children.props === "object" ? children.props : {}),
        };
        // Handle onClick separately based on the element type
        const eventHandlers = {
            onClick: (event) => {
                // Cast the event to make it compatible with handleSelect
                handleSelect(event);
                childProps.onClick?.(event);
            },
        };
        return React.cloneElement(children, {
            ...mergedProps,
            ...eventHandlers,
        });
    }
    return _jsx("div", { ...itemProps, children: children });
}
export function DropdownMenuGroup({ children, label, className, ref, ...props }) {
    return (_jsx("div", { ...props, ref: ref, role: "group", "aria-label": label, className: `tiptap-button-group ${className || ""}`, children: children }));
}
export function DropdownMenuSeparator({ className, ref, ...props }) {
    return (_jsx(Separator, { ref: ref, className: `tiptap-dropdown-menu-separator ${className || ""}`, ...props }));
}
//# sourceMappingURL=dropdown-menu.js.map