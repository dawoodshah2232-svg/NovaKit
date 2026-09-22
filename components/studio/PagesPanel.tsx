'use client';

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Copy,
  FileOutput,
  FilePlus,
  ImageOff,
  RotateCw,
  Trash2,
  X,
} from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';
import type { StudioPage } from './types';

interface PagesPanelProps {
  pages: StudioPage[];
  activeIndex: number;
  selectedKeys: string[];
  onSelect: (index: number, additive: boolean) => void;
  onReorder: (from: number, to: number) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onRotateSelected: (deg: 90 | 180 | 270) => void;
  onRotateAll: (deg: 90) => void;
  onAddBlank: () => void;
  onExtractSelected: () => void;
  onClose?: () => void;
}

const PANEL_ICON_BTN =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400';

function SortablePageThumb({
  page,
  index,
  isActive,
  isSelected,
  onSelect,
}: {
  page: StudioPage;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (index: number, additive: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.key });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 20 : undefined,
    position: 'relative',
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    onSelect(index, e.ctrlKey || e.metaKey || e.shiftKey);
  };

  const ring = isActive
    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900'
    : isSelected
      ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900'
      : 'ring-1 ring-slate-800 hover:ring-slate-600';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`Page ${index + 1}${page.isBlank ? ', blank' : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(index, false);
        }
      }}
      className={`cursor-grab select-none rounded-lg bg-slate-800 p-1.5 transition-shadow active:cursor-grabbing ${ring}`}
      title={`Page ${index + 1} — click to select, Ctrl/⌘/Shift-click for multi-select, drag to reorder`}
    >
      <div className="relative overflow-hidden rounded-md bg-slate-950">
        <img
          src={page.thumbUrl}
          alt={`Page ${index + 1} thumbnail`}
          draggable={false}
          className="block w-full"
          style={{ maxWidth: 150 }}
        />
        <span className="absolute bottom-1 left-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[11px] font-semibold text-slate-100">
          {index + 1}
        </span>
        {page.rotation !== 0 && (
          <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-slate-950/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-300">
            <RotateCw className="h-3 w-3" />
            {page.rotation}°
          </span>
        )}
      </div>
    </div>
  );
}

export function PagesPanel(props: PagesPanelProps) {
  const {
    pages,
    activeIndex,
    selectedKeys,
    onSelect,
    onReorder,
    onDeleteSelected,
    onDuplicateSelected,
    onRotateSelected,
    onRotateAll,
    onAddBlank,
    onExtractSelected,
    onClose,
  } = props;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const selectedCount = selectedKeys.length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = pages.findIndex((p) => p.key === active.id);
    const to = pages.findIndex((p) => p.key === over.id);
    if (from === -1 || to === -1 || from === to) return;
    onReorder(from, to);
  };

  return (
    <aside
      aria-label="Pages"
      className="flex h-full w-[200px] shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-2 py-1.5">
        <span className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Pages
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title="Close pages panel"
            aria-label="Close pages panel"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="border-b border-slate-800 px-2 py-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onAddBlank}
            title="Add blank page"
            aria-label="Add blank page"
            className={PANEL_ICON_BTN}
          >
            <FilePlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRotateSelected(90)}
            disabled={selectedCount === 0}
            title="Rotate selected pages 90° clockwise"
            aria-label="Rotate selected pages 90° clockwise"
            className={PANEL_ICON_BTN}
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicateSelected}
            disabled={selectedCount === 0}
            title="Duplicate selected pages"
            aria-label="Duplicate selected pages"
            className={PANEL_ICON_BTN}
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onExtractSelected}
            disabled={selectedCount === 0}
            title="Extract selected pages to a new file"
            aria-label="Extract selected pages to a new file"
            className={PANEL_ICON_BTN}
          >
            <FileOutput className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            title="Delete selected pages (Delete)"
            aria-label="Delete selected pages"
            className={`${PANEL_ICON_BTN} hover:!text-red-400`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onRotateAll(90)}
          disabled={pages.length === 0}
          className="mt-1.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Rotate all 90°
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {pages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <ImageOff className="h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-400">No pages yet</p>
            <p className="px-4 text-xs text-slate-500">
              Open a PDF or add a blank page to get started.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pages.map((p) => p.key)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {pages.map((page, index) => (
                  <SortablePageThumb
                    key={page.key}
                    page={page}
                    index={index}
                    isActive={index === activeIndex}
                    isSelected={selectedKeys.includes(page.key)}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 px-3 py-2 text-center text-xs text-slate-500">
        {pages.length} page{pages.length === 1 ? '' : 's'} · {selectedCount}{' '}
        selected
      </div>
    </aside>
  );
}
