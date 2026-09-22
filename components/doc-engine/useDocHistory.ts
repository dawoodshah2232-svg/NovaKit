'use client';

import { useCallback, useRef, useState } from 'react';
import type { DocState } from '@/lib/doc-engine/types';

const HISTORY_CAP = 60;

const clone = (d: DocState): DocState => structuredClone(d);

export interface DocHistoryApi {
  doc: DocState;
  /**
   * Apply a transform. pushHistory=true (default) records the pre-change
   * state for undo and clears the redo stack; false applies transiently
   * (e.g. during a drag) so intermediate states never pollute history.
   * Implemented without setState updaters so it is StrictMode-safe.
   */
  update: (fn: (d: DocState) => DocState, pushHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Replace the document and clear both stacks (new/template/load). */
  reset: (d: DocState) => void;
}

export function useDocHistory(initial: DocState): DocHistoryApi {
  const [doc, setDoc] = useState<DocState>(() => clone(initial));
  const docRef = useRef<DocState>(doc);
  const past = useRef<DocState[]>([]);
  const future = useRef<DocState[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  const update = useCallback(
    (fn: (d: DocState) => DocState, pushHistory = true) => {
      const prev = docRef.current;
      const next = fn(clone(prev));
      if (pushHistory) {
        past.current.push(clone(prev));
        if (past.current.length > HISTORY_CAP) past.current.shift();
        future.current = [];
      }
      docRef.current = next;
      setDoc(next);
      syncFlags();
    },
    [syncFlags],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(clone(docRef.current));
    docRef.current = prev;
    setDoc(prev);
    syncFlags();
  }, [syncFlags]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(clone(docRef.current));
    docRef.current = next;
    setDoc(next);
    syncFlags();
  }, [syncFlags]);

  const reset = useCallback(
    (d: DocState) => {
      past.current = [];
      future.current = [];
      const next = clone(d);
      docRef.current = next;
      setDoc(next);
      syncFlags();
    },
    [syncFlags],
  );

  return {
    doc,
    update,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
