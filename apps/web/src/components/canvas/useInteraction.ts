import { useState, useRef, useCallback } from 'react';
import {
  CanvasNode,
  InteractionState,
  Point,
  ResizeHandle,
  ToolType,
  createNode,
  resizeNode,
  DragSnapshot,
  NodeType
} from './types';

interface UseInteractionProps {
  awareness: any;
  nodes: CanvasNode[];
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;
  lockNode: (id: string, userId: string) => void;
  unlockNode: (id: string) => void;
  selectedIds: Set<string>;
  selectNode: (id: string, isAdditive: boolean) => void;
  clearSelection: () => void;
  startSelectionBox: (x: number, y: number) => void;
  updateSelectionBox: (x: number, y: number) => void;
  endSelectionBox: (nodes: CanvasNode[], isAdditive: boolean) => Set<string>;
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;
  selectedColor: string;
  stickyBg: string;
  editingTextRef: React.MutableRefObject<string>;
  getCoordinates: (e: React.MouseEvent) => Point | null;
}

export function useInteraction({
  awareness,
  nodes,
  addNode,
  updateNode,
  deleteNode,
  lockNode,
  unlockNode,
  selectedIds,
  selectNode,
  clearSelection,
  startSelectionBox,
  updateSelectionBox,
  endSelectionBox,
  selectedTool,
  setSelectedTool,
  selectedColor,
  stickyBg,
  editingTextRef,
  getCoordinates,
}: UseInteractionProps) {
  const [interactionState, setInteractionState] = useState<InteractionState>('idle');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Drag / resize internal state
  const dragStartMouse = useRef<Point | null>(null);
  const dragStartNodes = useRef<DragSnapshot[]>([]);
  const resizeHandle = useRef<ResizeHandle | null>(null);
  const activeNodeId = useRef<string | null>(null);

  // Helper to get local user info
  const getCurrentUser = useCallback(() => {
    const localState = awareness?.getLocalState?.();
    const user = localState?.user || {};
    return {
      name: user.name || 'Anonymous',
      color: user.color || '#3B82F6',
      clientId: awareness?.clientID?.toString() || 'local'
    };
  }, [awareness]);

  const isNodeOwner = useCallback((node: CanvasNode) => {
    const user = getCurrentUser();
    return node.createdBy === user.name && node.createdByColor === user.color;
  }, [getCurrentUser]);

  // Unified MouseDown Handler for Canvas Background
  const handleBackgroundMouseDown = useCallback((e: React.MouseEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    // Save active text edit before deselecting
    if (editingId) {
      updateNode(editingId, { text: editingTextRef.current });
      editingTextRef.current = '';
      setEditingId(null);
    }

    clearSelection();

    if (selectedTool === 'eraser') return;

    if (selectedTool === 'select') {
      setInteractionState('box-selecting');
      startSelectionBox(coords.x, coords.y);
      return;
    }

    // Creating a new shape
    const user = getCurrentUser();
    
    // Map tool names to NodeType
    let nodeType: NodeType = 'rectangle';
    if (selectedTool === 'pen') nodeType = 'pen';
    else if (selectedTool === 'circle') nodeType = 'circle';
    else if (selectedTool === 'diamond') nodeType = 'diamond';
    else if (selectedTool === 'line') nodeType = 'line';
    else if (selectedTool === 'arrow') nodeType = 'arrow';
    else if (selectedTool === 'text') nodeType = 'text';
    else if (selectedTool === 'sticky') nodeType = 'sticky';

    const newNode = createNode(
      nodeType,
      coords.x,
      coords.y,
      user.name,
      user.color,
      {
        color: selectedColor,
        fill: selectedTool === 'sticky' ? stickyBg : 'none',
        stickyColor: selectedTool === 'sticky' ? stickyBg : '',
        points: selectedTool === 'pen' ? [coords] : []
      }
    );

    addNode(newNode);
    activeNodeId.current = newNode.id;

    if (selectedTool === 'pen') {
      setInteractionState('drawing');
      dragStartMouse.current = coords;
    } else if (selectedTool === 'text' || selectedTool === 'sticky') {
      // Direct transition to edit mode
      selectNode(newNode.id, false);
      setEditingId(newNode.id);
      setInteractionState('idle');
      activeNodeId.current = null;
    } else {
      setInteractionState('drawing');
      dragStartMouse.current = coords;
    }
  }, [
    getCoordinates,
    editingId,
    selectedTool,
    clearSelection,
    startSelectionBox,
    getCurrentUser,
    selectedColor,
    stickyBg,
    addNode,
    selectNode,
    updateNode,
    editingTextRef,
  ]);

  // MouseDown Handler for Resize Handles
  const handleResizeHandleMouseDown = useCallback((e: React.MouseEvent, nodeId: string, handle: ResizeHandle) => {
    e.stopPropagation();
    const coords = getCoordinates(e);
    if (!coords) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node || !isNodeOwner(node) || node.locked) return;

    setInteractionState('resizing');
    resizeHandle.current = handle;
    dragStartMouse.current = coords;
    
    dragStartNodes.current = [{
      nodeId: node.id,
      startX: node.x,
      startY: node.y,
      startWidth: node.width,
      startHeight: node.height
    }];

    // Also store initial size in snapshot temporarily using points as metadata if needed
    // or just look up node directly in mouseMove
  }, [getCoordinates, nodes, isNodeOwner]);

  // MouseDown Handler for Shapes
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    const coords = getCoordinates(e);
    if (!coords) return;

    if (selectedTool === 'eraser') {
      if (isNodeOwner(node)) {
        deleteNode(node.id);
        clearSelection();
      }
      return;
    }

    if (!isNodeOwner(node) || node.locked) {
      // Just select but don't allow drag
      selectNode(node.id, e.shiftKey);
      return;
    }

    const isAdditive = e.shiftKey;
    selectNode(node.id, isAdditive);

    // Compute the next selection state synchronously to avoid React state batching delay
    const currentSelection = new Set<string>();
    if (isAdditive) {
      selectedIds.forEach(id => currentSelection.add(id));
      if (currentSelection.has(node.id)) {
        currentSelection.delete(node.id);
      } else {
        currentSelection.add(node.id);
      }
    } else {
      currentSelection.add(node.id);
    }

    // Lock nodes for current user via Yjs
    const user = getCurrentUser();
    currentSelection.forEach((id) => {
      lockNode(id, user.name);
    });

    setInteractionState('dragging');
    dragStartMouse.current = coords;

    // Snapshot all currently selected nodes
    dragStartNodes.current = nodes
      .filter(n => currentSelection.has(n.id) && isNodeOwner(n) && !n.locked)
      .map(n => ({
        nodeId: n.id,
        startX: n.x,
        startY: n.y
      }));
  }, [
    getCoordinates,
    selectedTool,
    isNodeOwner,
    deleteNode,
    clearSelection,
    selectNode,
    lockNode,
    getCurrentUser,
    selectedIds,
    nodes
  ]);

  // Unified MouseMove Handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    // Stream awareness cursor
    if (awareness) {
      const currentToolLabel = selectedTool === 'select' ? 'Moving' : `Drawing ${selectedTool}`;
      awareness.setLocalStateField('canvasCursor', {
        x: coords.x,
        y: coords.y,
        tool: selectedTool,
        action: interactionState === 'dragging' ? 'Moving' : interactionState === 'resizing' ? 'Resizing' : currentToolLabel
      });
    }

    if (interactionState === 'idle') return;

    if (interactionState === 'box-selecting') {
      updateSelectionBox(coords.x, coords.y);
      return;
    }

    if (interactionState === 'drawing' && activeNodeId.current && dragStartMouse.current) {
      const activeNode = nodes.find(n => n.id === activeNodeId.current);
      if (!activeNode) return;

      const dx = coords.x - dragStartMouse.current.x;
      const dy = coords.y - dragStartMouse.current.y;

      if (activeNode.type === 'pen') {
        const updatedPoints = [...activeNode.points, coords];
        updateNode(activeNode.id, { points: updatedPoints });
      } else if (activeNode.type === 'arrow' || activeNode.type === 'line') {
        updateNode(activeNode.id, { width: dx, height: dy });
      } else {
        updateNode(activeNode.id, {
          x: dx < 0 ? coords.x : dragStartMouse.current.x,
          y: dy < 0 ? coords.y : dragStartMouse.current.y,
          width: Math.abs(dx),
          height: Math.abs(dy)
        });
      }
      return;
    }

    if (interactionState === 'dragging' && dragStartMouse.current) {
      const dx = coords.x - dragStartMouse.current.x;
      const dy = coords.y - dragStartMouse.current.y;

      dragStartNodes.current.forEach((snapshot) => {
        const node = nodes.find(n => n.id === snapshot.nodeId);
        if (!node) return;

        if (node.type === 'pen') {
          const offsetX = snapshot.startX - node.x + dx;
          const offsetY = snapshot.startY - node.y + dy;
          const updatedPoints = node.points.map(p => ({ x: p.x + offsetX, y: p.y + offsetY }));
          updateNode(node.id, {
            x: snapshot.startX + dx,
            y: snapshot.startY + dy,
            points: updatedPoints
          });
        } else {
          updateNode(node.id, {
            x: snapshot.startX + dx,
            y: snapshot.startY + dy
          });
        }
      });
      return;
    }

    if (interactionState === 'resizing' && dragStartMouse.current && resizeHandle.current) {
      const snapshot = dragStartNodes.current[0];
      if (!snapshot) return;

      const node = nodes.find(n => n.id === snapshot.nodeId);
      if (!node) return;

      const dx = coords.x - dragStartMouse.current.x;
      const dy = coords.y - dragStartMouse.current.y;

      const initialNodeState: CanvasNode = {
        ...node,
        x: snapshot.startX,
        y: snapshot.startY,
        width: snapshot.startWidth ?? node.width,
        height: snapshot.startHeight ?? node.height
      };

      const updates = resizeNode(initialNodeState, resizeHandle.current, dx, dy);
      updateNode(node.id, updates);
      
      // Update drag start anchor if position changes to keep resizing relative
      // (not needed for simple resize math, but improves stability)
      return;
    }
  }, [
    getCoordinates,
    awareness,
    getCurrentUser,
    selectedTool,
    interactionState,
    updateSelectionBox,
    nodes,
    updateNode
  ]);

  // Unified MouseUp Handler
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (interactionState === 'idle') return;

    if (interactionState === 'box-selecting') {
      endSelectionBox(nodes, e.shiftKey);
    } else if (interactionState === 'dragging') {
      // Unlock dragged nodes
      dragStartNodes.current.forEach((snapshot) => {
        unlockNode(snapshot.nodeId);
      });
    } else if (interactionState === 'drawing') {
      activeNodeId.current = null;
    }

    setInteractionState('idle');
    dragStartMouse.current = null;
    dragStartNodes.current = [];
    resizeHandle.current = null;
  }, [interactionState, nodes, endSelectionBox, unlockNode]);

  const handleNodeDoubleClick = useCallback((e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    if (!isNodeOwner(node) || node.locked) return;

    if (node.type === 'text' || node.type === 'sticky') {
      setSelectedTool('select');
      setEditingId(node.id);
    }
  }, [isNodeOwner, setEditingId, setSelectedTool]);

  return {
    interactionState,
    editingId,
    setEditingId,
    handleBackgroundMouseDown,
    handleResizeHandleMouseDown,
    handleNodeMouseDown,
    handleNodeDoubleClick,
    handleMouseMove,
    handleMouseUp,
    isNodeOwner
  };
}
