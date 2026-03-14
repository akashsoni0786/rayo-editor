// Note: Do NOT import global Tailwind or CSS files here
// The parent application (Rayo_dev) manages its own global styles
// Component-specific styles are imported locally within components

// Main BlogEditor component - exported as default and named
export { default as BlogEditor, default as RayoEditor, default } from './components/project/blog-writer/shared/BlogEditor';
export type { BlogEditorProps } from './components/project/blog-writer/shared/BlogEditor';

// BlogSimpleEditor for direct tiptap usage
export { BlogSimpleEditor } from './components/tiptap-templates/simple/blog-simple-editor';
export type { BlogSimpleEditorRef, BlogSimpleEditorProps } from './components/tiptap-templates/simple/blog-simple-editor';
