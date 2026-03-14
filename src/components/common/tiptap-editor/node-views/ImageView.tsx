import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
const IMAGE_MAX_SIZE = 100000;
const IMAGE_MIN_SIZE = 20;
const IMAGE_THROTTLE_WAIT_TIME = 16;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);
const throttle = <T extends (...args: any[]) => any>(fn: T, wait: number): T => {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastCall = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => { lastCall = Date.now(); timer = null; fn(...args); }, remaining);
    }
  }) as T;
};
import './ImageView.css';

interface ImageViewProps {
  editor: any;
  node: any;
  getPos: () => number;
  selected: boolean;
  updateAttributes: (attrs: Record<string, any>) => void;
}

interface Size {
  width: number;
  height: number;
}

// Resize direction constants
const ResizeDirection = {
  TOP_LEFT: 'tl',
  TOP_RIGHT: 'tr',
  BOTTOM_LEFT: 'bl',
  BOTTOM_RIGHT: 'br',
} as const;

type ResizeDirectionType = typeof ResizeDirection[keyof typeof ResizeDirection];

interface ResizerState {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: string;
}

function ImageView({ editor, node, getPos, selected, updateAttributes }: ImageViewProps) {
  const [maxSize, setMaxSize] = useState<Size>({
    width: IMAGE_MAX_SIZE,
    height: IMAGE_MAX_SIZE,
  });

  const [originalSize, setOriginalSize] = useState({
    width: 0,
    height: 0,
  });

  const [resizeDirections] = useState<ResizeDirectionType[]>([
    ResizeDirection.TOP_LEFT,
    ResizeDirection.TOP_RIGHT,
    ResizeDirection.BOTTOM_LEFT,
    ResizeDirection.BOTTOM_RIGHT,
  ]);

  const [resizing, setResizing] = useState<boolean>(false);

  const [resizerState, setResizerState] = useState<ResizerState>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    dir: '',
  });

  const { align, inline } = node?.attrs || {};

  // Prepare image attributes
  const imgAttrs = useMemo(() => {
    const { src, alt, width: w, height: h, flipX, flipY } = node?.attrs || {};

    const width = isNumber(w) ? `${w}px` : w;
    const height = isNumber(h) ? `${h}px` : h;
    const transformStyles: string[] = [];

    if (flipX) transformStyles.push('rotateX(180deg)');
    if (flipY) transformStyles.push('rotateY(180deg)');
    
    const transform = transformStyles.join(' ');

    return {
      src: src || undefined,
      alt: alt || undefined,
      style: {
        width: width || undefined,
        height: height || undefined,
        transform: transform || 'none',
      },
    };
  }, [node?.attrs]);

  // Container style for max width
  const imageMaxStyle = useMemo(() => {
    const {
      style: { width },
    } = imgAttrs;

    return { width: width === '100%' ? width : undefined };
  }, [imgAttrs]);

  // Handle image load to get original dimensions
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.target as HTMLImageElement;
    setOriginalSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }

  // Select image in the editor
  function selectImage() {
    editor.commands.setNodeSelection(getPos());
  }

  // Get the maximum available size for the image
  const getMaxSize = useCallback(
    throttle(() => {
      const { width } = getComputedStyle(editor.view.dom);
      setMaxSize((prev) => {
        return {
          ...prev,
          width: Number.parseInt(width, 10),
        };
      });
    }, IMAGE_THROTTLE_WAIT_TIME),
    [editor],
  );

  // Handle mouse down on resize handlers
  function onMouseDown(e: React.MouseEvent, dir: string) {
    e.preventDefault();
    e.stopPropagation();

    const originalWidth = originalSize.width;
    const originalHeight = originalSize.height;
    const aspectRatio = originalWidth / originalHeight;

    let width = Number(node.attrs.width);
    let height = Number(node.attrs.height);
    const maxWidth = maxSize.width;

    if (width && !height) {
      width = width > maxWidth ? maxWidth : width;
      height = Math.round(width / aspectRatio);
    } else if (height && !width) {
      width = Math.round(height * aspectRatio);
      width = width > maxWidth ? maxWidth : width;
    } else if (!width && !height) {
      width = originalWidth > maxWidth ? maxWidth : originalWidth;
      height = Math.round(width / aspectRatio);
    } else {
      width = width > maxWidth ? maxWidth : width;
    }

    setResizing(true);

    setResizerState({
      x: e.clientX,
      y: e.clientY,
      w: width,
      h: height,
      dir,
    });
  }

  // Handle mouse move for resizing
  const onMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!resizing) {
        return;
      }

      const { x, w, dir } = resizerState;

      const dx = (e.clientX - x) * (/l/.test(dir) ? -1 : 1);
      // Preserve aspect ratio by only using width (height will be calculated)
      const width = clamp(w + dx, IMAGE_MIN_SIZE, maxSize.width);
      const height = null; // Let the browser maintain aspect ratio

      updateAttributes({
        width,
        height,
      });
    }, IMAGE_THROTTLE_WAIT_TIME),
    [resizing, resizerState, maxSize, updateAttributes],
  );

  // Handle mouse up to finish resizing
  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!resizing) {
        return;
      }

      setResizerState({
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        dir: '',
      });
      setResizing(false);

      selectImage();
    },
    [resizing],
  );

  // Add/remove event listeners for mouse movements
  const onEvents = useCallback(() => {
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mouseup', onMouseUp, true);
  }, [onMouseMove, onMouseUp]);

  const offEvents = useCallback(() => {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mouseup', onMouseUp, true);
  }, [onMouseMove, onMouseUp]);

  // Set up resize event listeners
  useEffect(() => {
    if (resizing) {
      onEvents();
    } else {
      offEvents();
    }

    return () => {
      offEvents();
    };
  }, [resizing, onEvents, offEvents]);

  // Set up resize observer to track editor width changes
  const resizeObserver = useMemo(() => {
    return new ResizeObserver(() => getMaxSize());
  }, [getMaxSize]);

  useEffect(() => {
    const editorDom = editor.view.dom;
    resizeObserver.observe(editorDom);

    return () => {
      resizeObserver.disconnect();
    };
  }, [editor.view.dom, resizeObserver]);

  return (
    <NodeViewWrapper
      as={inline ? 'span' : 'div'}
      className="image-view"
      style={{ ...imageMaxStyle, textAlign: align, display: inline ? 'inline' : 'block' }}
    >
      <div
        data-drag-handle
        draggable="true"
        style={imageMaxStyle}
        className={`image-view__body ${selected ? 'image-view__body--focused' : ''} ${
          resizing ? 'image-view__body--resizing' : ''
        }`}
      >
        <img
          alt={imgAttrs.alt || ""}
          className="image-view__body__image block"
          height="auto"
          onClick={selectImage}
          onLoad={onImageLoad}
          src={imgAttrs.src}
          style={imgAttrs.style}
        />

        {editor.isEditable && (selected || resizing) && (
          <div className="image-resizer">
            {resizeDirections.map((direction) => (
              <span
                className={`image-resizer__handler image-resizer__handler--${direction}`}
                key={`image-dir-${direction}`}
                onMouseDown={(e) => onMouseDown(e, direction)}
              />
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default ImageView;
