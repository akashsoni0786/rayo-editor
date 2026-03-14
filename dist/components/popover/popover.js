import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useFloating, autoUpdate, offset, flip, shift, useClick, useDismiss, useRole, useInteractions, useMergeRefs, FloatingFocusManager, limitShift, FloatingPortal, } from "@floating-ui/react";
import "@/components/tiptap-ui-primitive/popover/popover.scss";
const PopoverContext = React.createContext(null);
function usePopoverContext() {
    const context = React.useContext(PopoverContext);
    if (!context) {
        throw new Error("Popover components must be wrapped in <Popover />");
    }
    return context;
}
function usePopover({ initialOpen = false, modal, open: controlledOpen, onOpenChange: setControlledOpen, side = "bottom", align = "center", sideOffset = 4, alignOffset = 0, } = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
    const [labelId, setLabelId] = React.useState();
    const [descriptionId, setDescriptionId] = React.useState();
    const [currentPlacement, setCurrentPlacement] = React.useState(`${side}-${align}`);
    const [offsets, setOffsets] = React.useState({ sideOffset, alignOffset });
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;
    const middleware = React.useMemo(() => [
        offset({
            mainAxis: offsets.sideOffset,
            crossAxis: offsets.alignOffset,
        }),
        flip({
            fallbackAxisSideDirection: "end",
            crossAxis: false,
        }),
        shift({
            limiter: limitShift({ offset: offsets.sideOffset }),
        }),
    ], [offsets.sideOffset, offsets.alignOffset]);
    const floating = useFloating({
        placement: currentPlacement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware,
    });
    const interactions = useInteractions([
        useClick(floating.context),
        useDismiss(floating.context),
        useRole(floating.context),
    ]);
    const updatePosition = React.useCallback((newSide, newAlign, newSideOffset, newAlignOffset) => {
        setCurrentPlacement(`${newSide}-${newAlign}`);
        if (newSideOffset !== undefined || newAlignOffset !== undefined) {
            setOffsets({
                sideOffset: newSideOffset ?? offsets.sideOffset,
                alignOffset: newAlignOffset ?? offsets.alignOffset,
            });
        }
    }, [offsets.sideOffset, offsets.alignOffset]);
    return React.useMemo(() => ({
        open,
        setOpen,
        ...interactions,
        ...floating,
        modal,
        labelId,
        descriptionId,
        setLabelId,
        setDescriptionId,
        updatePosition,
    }), [
        open,
        setOpen,
        interactions,
        floating,
        modal,
        labelId,
        descriptionId,
        updatePosition,
    ]);
}
function Popover({ children, modal = false, ...options }) {
    const popover = usePopover({ modal, ...options });
    return (_jsx(PopoverContext.Provider, { value: popover, children: children }));
}
function PopoverTrigger({ children, asChild = false, ref: propRef, ...props }) {
    const context = usePopoverContext();
    const childrenRef = React.isValidElement(children)
        ? parseInt(React.version, 10) >= 19
            ? children.props.ref
            : children.ref
        : undefined;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, context.getReferenceProps({
            ref,
            ...props,
            ...children.props,
            "data-state": context.open ? "open" : "closed",
        }));
    }
    return (_jsx("button", { ref: ref, "data-state": context.open ? "open" : "closed", ...context.getReferenceProps(props), children: children }));
}
function PopoverContent({ className, side = "bottom", align = "center", sideOffset, alignOffset, style, portal = true, portalProps = {}, asChild = false, children, ref: propRef, ...props }) {
    const context = usePopoverContext();
    const childrenRef = React.isValidElement(children)
        ? parseInt(React.version, 10) >= 19
            ? children.props.ref
            : children.ref
        : undefined;
    const ref = useMergeRefs([context.refs.setFloating, propRef, childrenRef]);
    React.useEffect(() => {
        context.updatePosition(side, align, sideOffset, alignOffset);
    }, [context, side, align, sideOffset, alignOffset]);
    if (!context.context.open)
        return null;
    const contentProps = {
        ref,
        style: {
            position: context.strategy,
            top: context.y ?? 0,
            left: context.x ?? 0,
            ...style,
        },
        "aria-labelledby": context.labelId,
        "aria-describedby": context.descriptionId,
        className: `tiptap-popover ${className || ""}`,
        "data-side": side,
        "data-align": align,
        "data-state": context.context.open ? "open" : "closed",
        ...context.getFloatingProps(props),
    };
    const content = asChild && React.isValidElement(children) ? (React.cloneElement(children, {
        ...contentProps,
        ...children.props,
    })) : (_jsx("div", { ...contentProps, children: children }));
    const wrappedContent = (_jsx(FloatingFocusManager, { context: context.context, modal: context.modal, children: content }));
    if (portal) {
        return _jsx(FloatingPortal, { ...portalProps, children: wrappedContent });
    }
    return wrappedContent;
}
export { Popover, PopoverTrigger, PopoverContent };
//# sourceMappingURL=popover.js.map