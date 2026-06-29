import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { CanvasNode, yMapToNode, nodeToYMap } from './types';

export interface UseCanvasNodesProps {
  ydoc: Y.Doc;
}

export function useCanvasNodes({ ydoc }: UseCanvasNodesProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);

  // Helper to get nodes sorted by zIndex
  const getSortedNodes = useCallback((yNodes: Y.Map<Y.Map<any>>) => {
    const list: CanvasNode[] = [];
    yNodes.forEach((yNode) => {
      if (yNode instanceof Y.Map) {
        list.push(yMapToNode(yNode));
      }
    });
    return list.sort((a, b) => a.zIndex - b.zIndex);
  }, []);

  // Sync state from Yjs
  useEffect(() => {
    const yNodes = ydoc.getMap<Y.Map<any>>('canvas-nodes');

    const handleUpdate = () => {
      setNodes(getSortedNodes(yNodes));
    };

    // Initial load
    handleUpdate();

    // Listen for deep changes (nested node map property changes)
    yNodes.observeDeep(handleUpdate);

    return () => {
      yNodes.unobserveDeep(handleUpdate);
    };
  }, [ydoc, getSortedNodes]);

  // CRUD Operations
  const addNode = useCallback((node: CanvasNode) => {
    const yNodes = ydoc.getMap<Y.Map<any>>('canvas-nodes');
    const yNode = nodeToYMap(node);
    ydoc.transact(() => {
      yNodes.set(node.id, yNode);
    });
  }, [ydoc]);

  const updateNode = useCallback((id: string, updates: Partial<CanvasNode>) => {
    const yNodes = ydoc.getMap<Y.Map<any>>('canvas-nodes');
    const yNode = yNodes.get(id);
    if (!yNode) return;

    ydoc.transact(() => {
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'points' && Array.isArray(value)) {
          const yArr = new Y.Array();
          if (value.length > 0) yArr.push(value);
          yNode.set(key, yArr);
        } else {
          yNode.set(key, value);
        }
      });
      yNode.set('updatedAt', Date.now());
    });
  }, [ydoc]);

  const deleteNode = useCallback((id: string) => {
    const yNodes = ydoc.getMap<Y.Map<any>>('canvas-nodes');
    ydoc.transact(() => {
      yNodes.delete(id);
    });
  }, [ydoc]);

  const deleteNodes = useCallback((ids: string[]) => {
    const yNodes = ydoc.getMap<Y.Map<any>>('canvas-nodes');
    ydoc.transact(() => {
      ids.forEach(id => yNodes.delete(id));
    });
  }, [ydoc]);

  const clearCanvas = useCallback(() => {
    const yNodes = ydoc.getMap<Y.Map<any>>('canvas-nodes');
    ydoc.transact(() => {
      yNodes.clear();
    });
  }, [ydoc]);

  // Bring to Front (highest zIndex)
  const bringToFront = useCallback((id: string) => {
    const yNodes = ydoc.getMap<Y.Map<any>>('canvas-nodes');
    const allNodes = getSortedNodes(yNodes);
    if (allNodes.length === 0) return;

    const maxZ = Math.max(...allNodes.map(n => n.zIndex));
    updateNode(id, { zIndex: maxZ + 1 });
  }, [getSortedNodes, updateNode]);

  // Send to Back (lowest zIndex)
  const sendToBack = useCallback((id: string) => {
    const yNodes = ydoc.getMap<Y.Map<any>>('canvas-nodes');
    const allNodes = getSortedNodes(yNodes);
    if (allNodes.length === 0) return;

    const minZ = Math.min(...allNodes.map(n => n.zIndex));
    updateNode(id, { zIndex: minZ - 1 });
  }, [getSortedNodes, updateNode]);

  // Locking mechanism (to avoid conflicts when editing/dragging)
  const lockNode = useCallback((id: string, userId: string) => {
    updateNode(id, { locked: true, lockedBy: userId });
  }, [updateNode]);

  const unlockNode = useCallback((id: string) => {
    updateNode(id, { locked: false, lockedBy: null });
  }, [updateNode]);

  return {
    nodes,
    addNode,
    updateNode,
    deleteNode,
    deleteNodes,
    clearCanvas,
    bringToFront,
    sendToBack,
    lockNode,
    unlockNode,
  };
}
