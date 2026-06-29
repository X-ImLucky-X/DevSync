import React from 'react';
import { 
  CanvasNode, 
  Rect, 
  ResizeHandle, 
  getResizeHandlePositions, 
  getResizeHandleCursor, 
  getNodeBounds, 
  STICKY_COLORS 
} from './types';

// Helper to format SVG points list from points array
export function getPathData(points: { x: number; y: number }[]): string {
  if (!points || points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

// ────────────────────────────────────────────
// Author Badge & Lock Indicator
// ────────────────────────────────────────────

export function renderAuthorBadge(node: CanvasNode) {
  if (!node.createdBy || !node.createdByColor) return null;

  const label = node.locked && node.lockedBy
    ? `${node.createdBy} (🔒 locked by ${node.lockedBy})`
    : node.createdBy;

  return (
    <g transform={`translate(${node.x}, ${node.y})`} key={`${node.id}-badge`} className="pointer-events-none select-none">
      <rect
        x={-4}
        y={-36}
        width={label.length * 5.5 + 14}
        height={18}
        rx={4}
        fill={node.createdByColor}
      />
      <text
        x={2}
        y={-24}
        fill="white"
        fontSize={9}
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        {label}
      </text>
    </g>
  );
}

// ────────────────────────────────────────────
// Selection Handles
// ────────────────────────────────────────────

interface SelectionOverlayProps {
  node: CanvasNode;
  onHandleMouseDown: (e: React.MouseEvent, nodeId: string, handle: ResizeHandle) => void;
}

export function renderSelectionOverlay({ node, onHandleMouseDown }: SelectionOverlayProps) {
  const bounds = getNodeBounds(node);
  const padding = 4;
  
  // Calculate padded bounds
  const px = bounds.x - padding;
  const py = bounds.y - padding;
  const pw = bounds.width + padding * 2;
  const ph = bounds.height + padding * 2;

  const handles = getResizeHandlePositions({ x: px, y: py, width: pw, height: ph });

  // Pen stroke shape doesn't need standard 8 handles (could just be simple bounds)
  // But let's show them for uniform look
  return (
    <g key={`${node.id}-selection-overlay`}>
      {/* Dashed outer boundary */}
      <rect
        x={px}
        y={py}
        width={pw}
        height={ph}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className="pointer-events-none"
      />

      {/* Rotation Indicator (Visual Only in Phase 1) */}
      <line
        x1={px + pw / 2}
        y1={py}
        x2={px + pw / 2}
        y2={py - 16}
        stroke="#3b82f6"
        strokeWidth="1.5"
        className="pointer-events-none"
      />
      <circle
        cx={px + pw / 2}
        cy={py - 16}
        r="4"
        fill="white"
        stroke="#3b82f6"
        strokeWidth="1.5"
        className="cursor-alias pointer-events-none"
      />

      {/* 8 Resize Handles */}
      {!node.locked && handles.map(({ handle, x, y }) => (
        <rect
          key={handle}
          x={x - 4}
          y={y - 4}
          width="8"
          height="8"
          fill="white"
          stroke="#3b82f6"
          strokeWidth="1.5"
          style={{ cursor: getResizeHandleCursor(handle) }}
          onMouseDown={(e) => onHandleMouseDown(e, node.id, handle)}
        />
      ))}
    </g>
  );
}

// ────────────────────────────────────────────
// Individual Shape Renderers
// ────────────────────────────────────────────

interface NodeRendererProps {
  node: CanvasNode;
  isEditing: boolean;
  isSelected: boolean;
  editingTextRef: React.MutableRefObject<string>;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  setEditingId: (id: string | null) => void;
  handleNodeMouseDown: (e: React.MouseEvent, node: CanvasNode) => void;
  handleNodeDoubleClick: (e: React.MouseEvent, node: CanvasNode) => void;
  isNodeOwner: (node: CanvasNode) => boolean;
}

export function renderNode({
  node,
  isEditing,
  isSelected,
  editingTextRef,
  updateNode,
  setEditingId,
  handleNodeMouseDown,
  handleNodeDoubleClick,
  isNodeOwner
}: NodeRendererProps) {
  const isLocked = node.locked;
  const ownerBorderClass = isSelected ? 'stroke-blue-500 filter drop-shadow-[0_0_2px_#3b82f6]' : '';

  const commonProps = {
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    onMouseDown: (e: React.MouseEvent) => handleNodeMouseDown(e, node),
    onDoubleClick: (e: React.MouseEvent) => handleNodeDoubleClick(e, node),
    style: { cursor: isLocked ? 'not-allowed' : 'pointer' }
  };

  switch (node.type) {
    case 'rectangle':
      return (
        <g key={node.id} {...commonProps}>
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            fill={node.fill || 'none'}
            stroke={node.color}
            strokeWidth={node.strokeWidth}
            rx="4"
            opacity={node.opacity}
            className={`transition-shadow ${ownerBorderClass}`}
          />
          {renderAuthorBadge(node)}
        </g>
      );

    case 'circle':
      return (
        <g key={node.id} {...commonProps}>
          <ellipse
            cx={node.x + node.width / 2}
            cy={node.y + node.height / 2}
            rx={Math.max(0, node.width / 2)}
            ry={Math.max(0, node.height / 2)}
            fill={node.fill || 'none'}
            stroke={node.color}
            strokeWidth={node.strokeWidth}
            opacity={node.opacity}
            className={ownerBorderClass}
          />
          {renderAuthorBadge(node)}
        </g>
      );

    case 'diamond':
      const cx = node.x + node.width / 2;
      const cy = node.y + node.height / 2;
      const pts = `${cx},${node.y} ${node.x + node.width},${cy} ${cx},${node.y + node.height} ${node.x},${cy}`;
      return (
        <g key={node.id} {...commonProps}>
          <polygon
            points={pts}
            fill={node.fill || 'none'}
            stroke={node.color}
            strokeWidth={node.strokeWidth}
            opacity={node.opacity}
            className={ownerBorderClass}
          />
          {renderAuthorBadge(node)}
        </g>
      );

    case 'line':
      return (
        <g key={node.id} {...commonProps}>
          <path
            d={`M ${node.x} ${node.y} l ${node.width} ${node.height}`}
            fill="none"
            stroke={node.color}
            strokeWidth={node.strokeWidth}
            opacity={node.opacity}
            className={ownerBorderClass}
          />
          {renderAuthorBadge(node)}
        </g>
      );

    case 'arrow':
      return (
        <g key={node.id} {...commonProps}>
          <path
            d={`M ${node.x} ${node.y} l ${node.width} ${node.height}`}
            fill="none"
            stroke={node.color}
            strokeWidth={node.strokeWidth}
            opacity={node.opacity}
            markerEnd="url(#arrow-tip)"
            className={ownerBorderClass}
          />
          {renderAuthorBadge(node)}
        </g>
      );

    case 'pen':
      return (
        <g key={node.id} {...commonProps}>
          <path
            d={getPathData(node.points)}
            fill="none"
            stroke={node.color}
            strokeWidth={node.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={node.opacity}
            className={ownerBorderClass}
          />
          {renderAuthorBadge(node)}
        </g>
      );

    case 'text':
      if (isEditing && isNodeOwner(node)) {
        if (editingTextRef.current === '' && node.text) {
          editingTextRef.current = node.text;
        }
        return (
          <foreignObject
            key={node.id}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            style={{ overflow: 'visible', pointerEvents: 'auto' }}
          >
            <input
              type="text"
              defaultValue={node.text}
              autoFocus
              onChange={(e) => { editingTextRef.current = e.target.value; }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                updateNode(node.id, { text: e.target.value });
                editingTextRef.current = '';
                setEditingId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateNode(node.id, { text: e.currentTarget.value });
                  editingTextRef.current = '';
                  setEditingId(null);
                }
              }}
              className="w-full h-full bg-[#0a0d14] border border-blue-500 rounded px-1.5 py-0.5 text-slate-200 font-mono text-xs focus:outline-none text-center"
            />
          </foreignObject>
        );
      }

      return (
        <g key={node.id} {...commonProps}>
          {/* Transparent hit box background matching node bounds */}
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            fill="transparent"
            className="cursor-text"
          />
          <text
            x={node.x + node.width / 2}
            y={node.y + node.height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={node.color}
            fontSize="13"
            fontFamily="JetBrains Mono, monospace"
            className={`select-none pointer-events-none ${ownerBorderClass}`}
          >
            {node.text || 'Double click to edit'}
          </text>
          {renderAuthorBadge(node)}
        </g>
      );

    case 'sticky':
      const stickyMeta = STICKY_COLORS.find(c => c.bg === node.stickyColor) || STICKY_COLORS[0];
      return (
        <g key={node.id} {...commonProps}>
          {/* Sticky Note background paper */}
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            fill={node.stickyColor || '#FDE047'}
            filter="url(#sticky-shadow)"
            rx="8"
            className={`transition-shadow ${isSelected ? 'stroke-blue-500 stroke-2' : ''}`}
          />

          {isEditing && isNodeOwner(node) ? (
            <foreignObject
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              style={{ overflow: 'visible', pointerEvents: 'auto' }}
            >
              <textarea
                defaultValue={node.text}
                autoFocus
                ref={(el) => { if (el && editingTextRef.current === '') editingTextRef.current = node.text || ''; }}
                onChange={(e) => { editingTextRef.current = e.target.value; }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onBlur={(e) => {
                  updateNode(node.id, { text: e.target.value });
                  editingTextRef.current = '';
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    updateNode(node.id, { text: e.currentTarget.value });
                    editingTextRef.current = '';
                    setEditingId(null);
                  }
                }}
                style={{ color: stickyMeta.text }}
                className="w-full h-full p-2.5 bg-transparent font-medium text-xs border-none focus:outline-none resize-none leading-relaxed"
              />
            </foreignObject>
          ) : (
            <foreignObject
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              style={{ pointerEvents: 'none' }}
            >
              <div
                style={{ color: stickyMeta.text }}
                className="w-full h-full p-3 flex items-center justify-center text-center overflow-hidden break-words font-medium text-xs leading-normal select-none"
              >
                {node.text || 'Double click to edit'}
              </div>
            </foreignObject>
          )}
          {renderAuthorBadge(node)}
        </g>
      );

    default:
      return null;
  }
}

// ────────────────────────────────────────────
// Selection Box
// ────────────────────────────────────────────

export function renderSelectionBox(rect: Rect | null) {
  if (!rect) return null;
  return (
    <rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      fill="#3b82f6"
      fillOpacity="0.08"
      stroke="#3b82f6"
      strokeWidth="1"
      strokeDasharray="3 3"
      className="pointer-events-none"
    />
  );
}
