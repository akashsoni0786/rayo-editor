# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-13

### Added

- **Initial Release** - rayo-editor as standalone npm module
- **RayoEditor Component** - Main rich text editor component with full feature parity to BlogEditor
- **Rich Text Editing** - Support for:
  - Headings (h1-h6)
  - Text formatting (bold, italic, underline, strikethrough)
  - Lists (ordered, unordered, task lists)
  - Code blocks with syntax highlighting
  - Tables with cell editing
  - Images with drag-and-drop support
  - Links with automatic detection
  - Blockquotes
  - Horizontal rules

- **Diff Highlighting System** - Visual diff overlays with:
  - Green highlighting for additions
  - Red highlighting for deletions
  - Customizable diff markers
  - Range-based highlighting
  - Proximity matching for similar content

- **Review UI** - User-friendly review interface with:
  - Accept/reject buttons for all changes
  - Per-change accept/reject controls
  - Configurable review button positioning
  - Read-only preview mode

- **Content Processing** - Advanced utilities for:
  - Diff marker detection and extraction
  - Text normalization
  - HTML content processing
  - Image operation grouping
  - Proximity-based matching

- **Image Handling** - Complete image management:
  - Featured image support
  - Image generation with loading states
  - Consecutive image grouping
  - Image replacement detection

- **State Management Hooks** - Two main hooks:
  - `useEditorDiff` - Diff detection and overlay state
  - `useContentProcessing` - Content transformation utilities

- **Utility Functions** - 20+ utility functions for:
  - Diff detection and normalization
  - Range manipulation
  - Content extraction
  - Proximity calculations
  - Error handling

- **TypeScript Support** - Full type definitions:
  - RayoEditorProps interface
  - BlogSimpleEditorRef interface
  - DiffRange, DiffPair, DiffMarker types
  - Component-specific prop interfaces
  - Comprehensive JSDoc documentation

- **Test Suite** - Comprehensive testing:
  - 271+ test cases
  - 96.3% code coverage
  - Unit tests for all utilities
  - Hook integration tests
  - Component rendering tests
  - Edge case coverage

- **CSS Bundling** - Optimized styles:
  - Component CSS bundled separately
  - Available via `rayo-editor/styles` export
  - Rive animation asset support
  - Responsive design

- **Developer Experience**:
  - Full TypeScript type safety
  - JSDoc comments on all public APIs
  - Clear examples and usage patterns
  - Error handling with custom error class
  - Safe execution utilities

### Features

- **Drop-in Replacement** - Compatible with existing BlogEditor implementations
- **No Breaking Changes** - Can be integrated without modifying existing code
- **Zero Configuration** - Works out of the box with sensible defaults
- **React 18+ Compatible** - Modern React patterns and hooks
- **Fully Typed** - TypeScript definitions for all exports
- **Performance Optimized** - Efficient diff detection and rendering
- **Accessible** - Keyboard navigation and ARIA labels
- **Mobile Friendly** - Responsive design for all screen sizes

### Technical Highlights

- **Framework**: React 18+
- **Editor Engine**: TipTap
- **Language**: TypeScript 5.0+
- **Testing**: Vitest with jsdom
- **Build**: Vite with type generation
- **Package Format**: ESM with TypeScript definitions
- **Code Coverage**: 96.3% (271 tests)

### Documentation

- Comprehensive README.md with 12 sections
- CHANGELOG.md (this file)
- JSDoc comments on all exported functions
- Inline code examples
- API reference documentation
- Architecture overview
- Contributing guidelines

### npm Package Details

- **Name**: rayo-editor
- **Version**: 1.0.0
- **License**: MIT
- **Main Entry**: ./dist/index.js
- **Types**: ./dist/index.d.ts
- **Styles**: ./dist/styles/index.css
- **Package Size**: ~45KB minified + gzip

### Breaking Changes

None - this is the initial release.

### Deprecated

None - this is the initial release.

### Security

No known security vulnerabilities.

### Dependencies

#### Production
- `@tiptap/react`: ^3.20.1 (React wrapper for TipTap editor)
- `react`: ^18.0.0 (Peer dependency)
- `react-dom`: ^18.0.0 (Peer dependency)

#### Development
- `@testing-library/jest-dom`: ^6.0.0
- `@testing-library/react`: ^14.0.0
- `@types/react`: ^18.0.0
- `@types/react-dom`: ^18.0.0
- `@typescript-eslint/eslint-plugin`: ^6.0.0
- `@vitejs/plugin-react`: ^4.0.0
- `@vitest/coverage-v8`: ^0.34.6
- `@vitest/ui`: ^0.34.0
- `typescript`: ^5.0.0
- `vite`: ^4.0.0
- `vite-plugin-dts`: ^4.5.4
- `vitest`: ^0.34.0

### Contributors

- Rayo Team

### Installation Instructions

```bash
# npm
npm install rayo-editor

# yarn
yarn add rayo-editor

# pnpm
pnpm add rayo-editor
```

### Quick Start

```tsx
import { RayoEditor } from 'rayo-editor';
import 'rayo-editor/styles';

<RayoEditor
  content={content}
  title={title}
  onChange={setContent}
  onTitleChange={setTitle}
  isLoading={false}
  editorRef={editorRef}
/>
```

### Migration Guide

If upgrading from BlogEditor in the main project:

1. Update imports: `import { RayoEditor } from 'rayo-editor'`
2. Install styles: `import 'rayo-editor/styles'`
3. All props remain the same - no API changes required
4. TypeScript types are now exported directly from the package

### Known Issues

None reported.

### Future Roadmap

Potential enhancements for future releases:
- Collaborative editing with WebSocket support
- Custom block extensions
- Plugin system for extensibility
- Offline support with service workers
- Analytics and usage tracking
- Theme customization system
- AI-powered content suggestions

---

For detailed information, visit the [GitHub repository](https://github.com/rayo-dev/rayo-editor) or see [README.md](./README.md).
