import { default as React } from 'react';
import { RayoEditorProps } from '../types/editor.types';
/**
 * Main Rayo Editor component - a professional-grade rich text editor
 *
 * This component provides a complete rich text editing experience with support for:
 * - Full HTML editing with headings, lists, code blocks, tables, images
 * - Diff highlighting with green (additions) and red (deletions) overlays
 * - Review UI for accepting/rejecting changes
 * - Image handling with generation support
 * - Keyboard shortcuts and accessibility
 * - Responsive design for all screen sizes
 *
 * The component is a drop-in replacement for BlogEditor with identical API.
 *
 * @component
 * @param props - RayoEditorProps configuration object
 * @returns React component for rich text editing
 *
 * @example
 * ```tsx
 * import { RayoEditor } from 'rayo-editor';
 * import 'rayo-editor/styles';
 *
 * export function MyEditor() {
 *   const editorRef = useRef<BlogSimpleEditorRef>(null);
 *   const [content, setContent] = useState('');
 *   const [title, setTitle] = useState('');
 *
 *   return (
 *     <RayoEditor
 *       content={content}
 *       title={title}
 *       onChange={setContent}
 *       onTitleChange={setTitle}
 *       isLoading={false}
 *       editorRef={editorRef}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * With diff highlighting:
 * ```tsx
 * <RayoEditor
 *   content={content}
 *   title={title}
 *   onChange={setContent}
 *   onTitleChange={setTitle}
 *   showDiffs={true}
 *   pendingChanges={true}
 *   onAcceptChanges={() => console.log('Accepted')}
 *   onRejectChanges={() => console.log('Rejected')}
 *   isLoading={false}
 *   editorRef={editorRef}
 * />
 * ```
 *
 * @example
 * Read-only mode:
 * ```tsx
 * <RayoEditor
 *   content={publishedContent}
 *   title={publishedTitle}
 *   onChange={() => {}}
 *   readOnly={true}
 *   isLoading={false}
 *   editorRef={editorRef}
 * />
 * ```
 */
export declare const RayoEditor: React.FC<RayoEditorProps>;
//# sourceMappingURL=RayoEditor.d.ts.map