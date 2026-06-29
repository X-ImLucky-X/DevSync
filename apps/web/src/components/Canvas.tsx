import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { useCanvasNodes } from './canvas/useCanvasNodes';
import { useSelection } from './canvas/useSelection';
import { useInteraction } from './canvas/useInteraction';
import { renderNode, renderSelectionOverlay, renderSelectionBox } from './canvas/renderers';
import { Toolbar } from './canvas/Toolbar';
import { PropertyPanel } from './canvas/PropertyPanel';
import { ContextMenu } from './canvas/ContextMenu';
import { CanvasNode, ToolType, PRESET_COLORS, STICKY_COLORS, Point, RemoteCursor } from './canvas/types';

interface CanvasProps {
  ydoc: Y.Doc;
  awareness: any;
  readOnly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ ydoc, awareness, readOnly = false }) => {
  // 1. Color and Tool states
  const [selectedTool, setSelectedTool] = useState<ToolType>('pen');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [stickyBg, setStickyBg] = useState(STICKY_COLORS[0].bg);

  // 2. Element states & selections
  const {
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
  } = useCanvasNodes({ ydoc });

  const {
    selectedIds,
    selectionBox,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    selectNode,
    clearSelection,
  } = useSelection();

  // Ref to track text updates during live editing without re-triggering parent states
  const editingTextRef = useRef<string>('');
  const svgRef = useRef<SVGSVGElement>(null);

  // Coordinates helper
  const getCoordinates = useCallback((e: React.MouseEvent): Point | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // 3. User interaction state machine
  const {
    editingId,
    setEditingId,
    handleBackgroundMouseDown,
    handleResizeHandleMouseDown,
    handleNodeMouseDown,
    handleNodeDoubleClick,
    handleMouseMove,
    handleMouseUp,
    isNodeOwner,
  } = useInteraction({
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
  });

  // Get current user info from awareness
  const getCurrentUser = useCallback(() => {
    const localState = awareness?.getLocalState?.();
    const user = localState?.user || {};
    return {
      name: user.name || 'Anonymous',
      color: user.color || '#3B82F6',
    };
  }, [awareness]);

  // Remote Awareness Cursors
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);

  useEffect(() => {
    if (!awareness) return;

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const cursors: RemoteCursor[] = [];
      states.forEach((state: any, clientId: number) => {
        if (clientId === awareness.clientID) return;
        if (state.user && state.canvasCursor) {
          cursors.push({
            id: clientId.toString(),
            name: state.user.name,
            color: state.user.color || '#3B82F6',
            x: state.canvasCursor.x,
            y: state.canvasCursor.y,
            tool: state.canvasCursor.tool,
            action: state.canvasCursor.action
          });
        }
      });
      setRemoteCursors(cursors);
    };

    awareness.on('change', handleAwarenessChange);
    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness]);

  // Clean cursor local state on unmount
  useEffect(() => {
    return () => {
      if (awareness) {
        awareness.setLocalStateField('canvasCursor', null);
      }
    };
  }, [awareness]);

  // 4. Context Menu State & Handlers
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string | null } | null>(null);

  const handleContextMenuOpen = (e: React.MouseEvent, nodeId: string | null) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId
    });
  };

  const handleDuplicate = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      const user = getCurrentUser();
      const duplicatedNode: CanvasNode = {
        ...node,
        id: Math.random().toString(36).substring(2, 9),
        x: node.x + 20,
        y: node.y + 20,
        createdBy: user.name,
        createdByColor: user.color,
        zIndex: Date.now(),
        locked: false,
        lockedBy: null,
      };
      addNode(duplicatedNode);
      selectNode(duplicatedNode.id, false);
    }
  };

  const handleDeleteSelected = () => {
    const idsToDelete = Array.from(selectedIds).filter(id => {
      const node = nodes.find(n => n.id === id);
      return node ? isNodeOwner(node) : false;
    });
    deleteNodes(idsToDelete);
    clearSelection();
  };

  const handleLockToggle = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node && isNodeOwner(node)) {
      if (node.locked) {
        unlockNode(id);
      } else {
        const user = getCurrentUser();
        lockNode(id, user.name);
      }
    }
  };

  const selectedNodes = nodes.filter(n => selectedIds.has(n.id));

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-[#080c14] relative select-none overflow-hidden"
      onContextMenu={(e) => !readOnly && handleContextMenuOpen(e, null)}
    >
      {/* 1. Canvas SVG Viewport */}
      <div className="flex-1 min-h-0 relative">
        <svg
          ref={svgRef}
          onMouseDown={readOnly ? undefined : handleBackgroundMouseDown}
          onMouseMove={readOnly ? undefined : handleMouseMove}
          onMouseUp={readOnly ? undefined : handleMouseUp}
          className={`w-full h-full cursor-crosshair overflow-hidden ${readOnly ? 'pointer-events-none' : ''}`}
        >
          {/* Defs for Grid Background, Arrow Markers & Shadow Filter */}
          <defs>
            <pattern id="canvas-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.035" />
            </pattern>
            
            <marker
              id="arrow-tip"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="context-stroke" />
            </marker>

            <filter id="sticky-shadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#canvas-grid)" />

          {/* Render All Canvas Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedIds.has(node.id);
            const isEditing = editingId === node.id;

            return (
              <g 
                key={node.id}
                onContextMenu={(e) => handleContextMenuOpen(e, node.id)}
              >
                {renderNode({
                  node,
                  isEditing,
                  isSelected,
                  editingTextRef,
                  updateNode,
                  setEditingId,
                  handleNodeMouseDown,
                  handleNodeDoubleClick,
                  isNodeOwner
                })}
              </g>
            );
          })}

          {/* Selection Outlines & Resize Handles (Only for selected items) */}
          {selectedNodes.map((node) => (
            <g key={`select-overlay-${node.id}`}>
              {renderSelectionOverlay({
                node,
                onHandleMouseDown: handleResizeHandleMouseDown
              })}
            </g>
          ))}

          {/* Drag Selection Box (dashed blue rectangle when dragging on empty background) */}
          {renderSelectionBox(selectionBox)}

          {/* Remote Awareness Cursors (With Collaborative Labels) */}
          {remoteCursors.map((cursor) => {
            const label = cursor.action 
              ? `${cursor.name} — ${cursor.action}`
              : cursor.name;

            return (
              <g
                key={cursor.id}
                transform={`translate(${cursor.x}, ${cursor.y})`}
                className="pointer-events-none transition-all duration-75 select-none"
              >
                <path 
                  d="M0,0 L0,15 L4.5,11.5 L9.5,20 L11.5,19 L6.5,10.5 L11.5,10.5 Z" 
                  fill={cursor.color} 
                  stroke="white" 
                  strokeWidth="1" 
                />
                <rect 
                  x="12" 
                  y="10" 
                  width={label.length * 6 + 14} 
                  height={18} 
                  rx={4} 
                  fill={cursor.color} 
                />
                <text 
                  x="17" 
                  y="22" 
                  fill="white" 
                  fontSize="9" 
                  fontFamily="sans-serif" 
                  fontWeight="bold"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2. Floating Toolbar Overlay */}
      {!readOnly && (
        <Toolbar
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          stickyBg={stickyBg}
          setStickyBg={setStickyBg}
          onClearCanvas={clearCanvas}
          onDeleteSelected={handleDeleteSelected}
          hasSelection={selectedIds.size > 0}
        />
      )}

      {/* 3. Floating Property Panel (Selected Nodes Customization) */}
      {!readOnly && (
        <PropertyPanel
          selectedNodes={selectedNodes}
          updateNode={updateNode}
          deleteNode={deleteNode}
          bringToFront={bringToFront}
          sendToBack={sendToBack}
          isNodeOwner={isNodeOwner}
        />
      )}

      {/* 4. Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={nodes.find(n => n.id === contextMenu.nodeId) || null}
          isOwner={contextMenu.nodeId ? (nodes.find(n => n.id === contextMenu.nodeId) ? isNodeOwner(nodes.find(n => n.id === contextMenu.nodeId)!) : false) : false}
          onClose={() => setContextMenu(null)}
          onDuplicate={handleDuplicate}
          onDelete={deleteNode}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onLockToggle={handleLockToggle}
        />
      )}
    </div>
  );
};
