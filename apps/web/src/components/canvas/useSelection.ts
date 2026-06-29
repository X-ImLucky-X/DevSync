import { useState, useCallback } from 'react';
import { CanvasNode, Rect, normalizeRect, getNodeBounds, isRectsOverlapping } from './types';

export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<Rect | null>(null);
  const [boxStart, setBoxStart] = useState<{ x: number; y: number } | null>(null);

  const selectNode = useCallback((id: string, isAdditive = false) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAdditive) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  }, []);

  const deselectNode = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Selection Box drawing helpers
  const startSelectionBox = useCallback((x: number, y: number) => {
    setBoxStart({ x, y });
    setSelectionBox({ x, y, width: 0, height: 0 });
  }, []);

  const updateSelectionBox = useCallback((x: number, y: number) => {
    if (!boxStart) return;
    const rect = normalizeRect(boxStart.x, boxStart.y, x, y);
    setSelectionBox(rect);
  }, [boxStart]);

  const endSelectionBox = useCallback((nodes: CanvasNode[], isAdditive = false) => {
    if (!selectionBox) {
      setBoxStart(null);
      setSelectionBox(null);
      return new Set<string>();
    }

    const newlySelected = new Set<string>();
    nodes.forEach((node) => {
      const bounds = getNodeBounds(node);
      if (isRectsOverlapping(selectionBox, bounds)) {
        newlySelected.add(node.id);
      }
    });

    setSelectedIds((prev) => {
      if (isAdditive) {
        const next = new Set(prev);
        newlySelected.forEach(id => next.add(id));
        return next;
      }
      return newlySelected;
    });

    setBoxStart(null);
    setSelectionBox(null);
    return newlySelected;
  }, [selectionBox]);

  const isNodeSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  return {
    selectedIds,
    setSelectedIds,
    selectionBox,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    selectNode,
    deselectNode,
    clearSelection,
    isNodeSelected,
  };
}
