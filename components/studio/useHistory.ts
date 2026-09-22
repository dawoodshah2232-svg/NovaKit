/**
 * PDFEdit Studio — undo/redo history.
 * Snapshot-based: every committed mutation pushes {pages, layers}. Drags commit
 * once on pointer-up. Cap 60 entries.
 */
import { useCallback, useRef, useState } from 'react';
import type { DocState } from './types';

const MAX_HISTORY = 60;

function cloneState(s: DocState): DocState {
  return JSON.parse(JSON.stringify(s)) as DocState;
}

function statesEqual(a: DocState, b: DocState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export interface HistoryApi {
  canUndo: boolean;
  canRedo: boolean;
  commit: (next: DocState) => void;
  undo: () => DocState | null;
  redo: () => DocState | null;
  reset: (initial: DocState) => void;
}

export function useHistory(initial: DocState): HistoryApi {
  const pastRef = useRef<DocState[]>([]);
  const futureRef = useRef<DocState[]>([]);
  const presentRef = useRef<DocState>(cloneState(initial));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const commit = useCallback(
    (next: DocState) => {
      const cloned = cloneState(next);
      if (statesEqual(presentRef.current, cloned)) return;
      pastRef.current.push(presentRef.current);
      if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
      presentRef.current = cloned;
      futureRef.current = [];
      syncFlags();
    },
    [syncFlags]
  );

  const undo = useCallback((): DocState | null => {
    const prev = pastRef.current.pop();
    if (!prev) return null;
    futureRef.current.push(presentRef.current);
    presentRef.current = prev;
    syncFlags();
    return cloneState(prev);
  }, [syncFlags]);

  const redo = useCallback((): DocState | null => {
    const next = futureRef.current.pop();
    if (!next) return null;
    pastRef.current.push(presentRef.current);
    presentRef.current = next;
    syncFlags();
    return cloneState(next);
  }, [syncFlags]);

  const reset = useCallback(
    (next: DocState) => {
      pastRef.current = [];
      futureRef.current = [];
      presentRef.current = cloneState(next);
      syncFlags();
    },
    [syncFlags]
  );

  return { canUndo, canRedo, commit, undo, redo, reset };
}
