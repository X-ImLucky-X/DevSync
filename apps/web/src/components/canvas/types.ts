// Canvas Engine — Core Types & Utilities

import * as Y from 'yjs';

// ────────────────────────────────────────────
// Geometry
// ────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ────────────────────────────────────────────
// Node Types
// ────────────────────────────────────────────

export type NodeType =
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'text'
  | 'sticky'
  | 'arrow'
  | 'line'
  | 'pen';

export type ToolType =
  | 'select'
  | 'pen'
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'line'
  | 'arrow'
  | 'text'
  | 'sticky'
  | 'eraser';

export type InteractionState =
  | 'idle'
  | 'dragging'
  | 'drawing'
  | 'resizing'
  | 'box-selecting'
  | 'editing';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

// ────────────────────────────────────────────
// The unified CanvasNode
// ────────────────────────────────────────────

export interface CanvasNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  lockedBy: string | null;
  // Visual
  color: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
  // Content (text / sticky)
  text: string;
  stickyColor: string;
  // Pen-specific
  points: Point[];
  // Arrow connector
  startNodeId: string | null;
  endNodeId: string | null;
  // Authoring
  createdBy: string;
  createdByColor: string;
  updatedAt: number;
}

// ────────────────────────────────────────────
// Remote cursor
// ────────────────────────────────────────────

export interface RemoteCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  tool?: string;
  action?: string;
}

// ────────────────────────────────────────────
// Drag snapshot (for multi-drag)
// ────────────────────────────────────────────

export interface DragSnapshot {
  nodeId: string;
  startX: number;
  startY: number;
  startWidth?: number;
  startHeight?: number;
}

// ────────────────────────────────────────────
// Color constants
// ────────────────────────────────────────────

export const STICKY_COLORS = [
  { name: 'Yellow', bg: '#FDE047', text: '#1E293B' },
  { name: 'Blue',   bg: '#60A5FA', text: '#FFFFFF' },
  { name: 'Green',  bg: '#4ADE80', text: '#1E293B' },
  { name: 'Pink',   bg: '#F472B6', text: '#FFFFFF' },
  { name: 'Purple', bg: '#A78BFA', text: '#FFFFFF' },
];

export const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EF4444', // Red
  '#FFFFFF', // White
];

// ────────────────────────────────────────────
// Node factory
// ────────────────────────────────────────────

export function createNode(
  type: NodeType,
  x: number,
  y: number,
  author: string,
  authorColor: string,
  extra: Partial<CanvasNode> = {}
): CanvasNode {
  const defaults: CanvasNode = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    x,
    y,
    width: type === 'sticky' ? 140 : type === 'text' ? 160 : 0,
    height: type === 'sticky' ? 140 : type === 'text' ? 28 : 0,
    rotation: 0,
    zIndex: Date.now(),
    locked: false,
    lockedBy: null,
    color: authorColor,
    fill: type === 'sticky' ? '#FDE047' : 'none',
    strokeWidth: type === 'pen' ? 3 : type === 'text' || type === 'sticky' ? 0 : 2,
    opacity: 1,
    text: type === 'text' ? 'Text' : type === 'sticky' ? '' : '',
    stickyColor: type === 'sticky' ? '#FDE047' : '',
    points: [],
    startNodeId: null,
    endNodeId: null,
    createdBy: author,
    createdByColor: authorColor,
    updatedAt: Date.now(),
  };
  return { ...defaults, ...extra };
}

// ────────────────────────────────────────────
// Geometry utilities
// ────────────────────────────────────────────

export function getNodeBounds(node: CanvasNode): Rect {
  if (node.type === 'pen' && node.points.length > 0) {
    const xs = node.points.map(p => p.x);
    const ys = node.points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return {
      x: minX,
      y: minY,
      width: Math.max(...xs) - minX || 10,
      height: Math.max(...ys) - minY || 10,
    };
  }
  if (node.type === 'line' || node.type === 'arrow') {
    const x1 = node.x, y1 = node.y;
    const x2 = node.x + node.width, y2 = node.y + node.height;
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(node.width) || 10,
      height: Math.abs(node.height) || 10,
    };
  }
  return {
    x: node.x,
    y: node.y,
    width: Math.max(node.width, 1),
    height: Math.max(node.height, 1),
  };
}

export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function isPointNearLine(
  point: Point,
  x1: number, y1: number,
  x2: number, y2: number,
  threshold = 8
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(point.x - x1, point.y - y1) <= threshold;
  let t = ((point.x - x1) * dx + (point.y - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(point.x - projX, point.y - projY) <= threshold;
}

export function isRectsOverlapping(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function normalizeRect(x1: number, y1: number, x2: number, y2: number): Rect {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

// ────────────────────────────────────────────
// Yjs ↔ Plain object conversion
// ────────────────────────────────────────────

export function yMapToNode(yMap: Y.Map<any>): CanvasNode {
  const raw: any = {};
  yMap.forEach((value, key) => {
    if (key === 'points' && value instanceof Y.Array) {
      raw[key] = value.toArray();
    } else {
      raw[key] = value;
    }
  });
  return raw as CanvasNode;
}

export function nodeToYMap(node: CanvasNode): Y.Map<any> {
  const yMap = new Y.Map();
  for (const [key, value] of Object.entries(node)) {
    if (key === 'points' && Array.isArray(value)) {
      const yArr = new Y.Array();
      // Store points as plain objects — Y.Array handles them fine
      if (value.length > 0) yArr.push(value);
      yMap.set(key, yArr);
    } else {
      yMap.set(key, value);
    }
  }
  return yMap;
}

export function resizeNode(
  node: CanvasNode,
  handle: ResizeHandle,
  dx: number,
  dy: number
): Partial<CanvasNode> {
  const minSize = 15;
  let { x, y, width: w, height: h } = node;

  switch (handle) {
    case 'nw': {
      const newW = Math.max(minSize, w - dx);
      const newH = Math.max(minSize, h - dy);
      return {
        x: x + (w - newW),
        y: y + (h - newH),
        width: newW,
        height: newH
      };
    }
    case 'n': {
      const newH = Math.max(minSize, h - dy);
      return {
        y: y + (h - newH),
        height: newH
      };
    }
    case 'ne': {
      const newW = Math.max(minSize, w + dx);
      const newH = Math.max(minSize, h - dy);
      return {
        y: y + (h - newH),
        width: newW,
        height: newH
      };
    }
    case 'e': {
      return { width: Math.max(minSize, w + dx) };
    }
    case 'se': {
      return {
        width: Math.max(minSize, w + dx),
        height: Math.max(minSize, h + dy)
      };
    }
    case 's': {
      return { height: Math.max(minSize, h + dy) };
    }
    case 'sw': {
      const newW = Math.max(minSize, w - dx);
      const newH = Math.max(minSize, h + dy);
      return {
        x: x + (w - newW),
        width: newW,
        height: newH
      };
    }
    case 'w': {
      const newW = Math.max(minSize, w - dx);
      return {
        x: x + (w - newW),
        width: newW
      };
    }
  }
}


// ────────────────────────────────────────────
// Resize handle positions
// ────────────────────────────────────────────

export function getResizeHandlePositions(bounds: Rect): { handle: ResizeHandle; x: number; y: number }[] {
  const { x, y, width: w, height: h } = bounds;
  return [
    { handle: 'nw', x: x,         y: y },
    { handle: 'n',  x: x + w / 2, y: y },
    { handle: 'ne', x: x + w,     y: y },
    { handle: 'e',  x: x + w,     y: y + h / 2 },
    { handle: 'se', x: x + w,     y: y + h },
    { handle: 's',  x: x + w / 2, y: y + h },
    { handle: 'sw', x: x,         y: y + h },
    { handle: 'w',  x: x,         y: y + h / 2 },
  ];
}

export function getResizeHandleCursor(handle: ResizeHandle): string {
  const cursors: Record<ResizeHandle, string> = {
    nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize',
    e: 'ew-resize', se: 'nwse-resize', s: 'ns-resize',
    sw: 'nesw-resize', w: 'ew-resize',
  };
  return cursors[handle];
}
