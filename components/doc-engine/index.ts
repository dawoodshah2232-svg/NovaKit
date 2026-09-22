/**
 * Document engine — shared UI components.
 * Used by Studio V2 and CV Builder V2 (and future document products).
 */
export { useDocHistory, type DocHistoryApi } from './useDocHistory';
export { DocCanvas, type DocCanvasProps } from './DocCanvas';
export { FormatToolbar, type FormatToolbarProps } from './FormatToolbar';
export { exportDocPdf, docToPdfBytes } from './docExport';
export { PagesPanel, LayersPanel, ElementsPanel, type ElementKind } from './panels';
export { DocShell, type DocShellProps, type DocShellTab } from './DocShell';
