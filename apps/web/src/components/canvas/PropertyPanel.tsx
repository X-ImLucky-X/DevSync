import React from 'react';
import { CanvasNode, STICKY_COLORS, PRESET_COLORS } from './types';

interface PropertyPanelProps {
  selectedNodes: CanvasNode[];
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  isNodeOwner: (node: CanvasNode) => boolean;
}

export function PropertyPanel({
  selectedNodes,
  updateNode,
  deleteNode,
  bringToFront,
  sendToBack,
  isNodeOwner,
}: PropertyPanelProps) {
  // If no nodes or multi-selection, keep it simple (or adjust first node)
  if (selectedNodes.length === 0) return null;
  
  const node = selectedNodes[0];
  const isOwner = isNodeOwner(node);

  const handleColorChange = (color: string) => {
    if (!isOwner) return;
    if (node.type === 'sticky') {
      updateNode(node.id, { stickyColor: color, fill: color });
    } else {
      updateNode(node.id, { color });
    }
  };

  const handleFillChange = (fill: string) => {
    if (!isOwner) return;
    updateNode(node.id, { fill });
  };

  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    updateNode(node.id, { strokeWidth: parseInt(e.target.value, 10) });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    updateNode(node.id, { opacity: parseFloat(e.target.value) });
  };

  return (
    <div className="absolute bottom-4 left-4 bg-[#101520]/95 backdrop-blur border border-slate-800/80 p-4 rounded-2xl shadow-xl z-10 flex flex-col gap-3 text-left w-48 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Properties {selectedNodes.length > 1 && `(${selectedNodes.length})`}
        </span>
        {isOwner && (
          <button 
            onClick={() => deleteNode(node.id)}
            className="text-xs text-rose-500 hover:text-rose-400 font-semibold"
          >
            Delete
          </button>
        )}
      </div>

      {/* Owner controls only */}
      {!isOwner && (
        <div className="text-[10px] text-slate-400 italic">
          View only (owned by {node.createdBy})
        </div>
      )}

      {isOwner && (
        <>
          {/* Stroke Width Slider (only for drawing nodes, not stickies) */}
          {node.type !== 'sticky' && node.type !== 'text' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400">Thickness</label>
              <input
                type="range"
                min="1"
                max="8"
                value={node.strokeWidth || 2}
                onChange={handleStrokeWidthChange}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}

          {/* Opacity Slider */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400">Opacity</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={node.opacity !== undefined ? node.opacity : 1}
              onChange={handleOpacityChange}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Color changer */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400">
              {node.type === 'sticky' ? 'Background Color' : 'Color'}
            </label>
            {node.type === 'sticky' ? (
              <div className="flex items-center gap-1.5">
                {STICKY_COLORS.map(color => (
                  <button
                    key={color.bg}
                    onClick={() => handleColorChange(color.bg)}
                    style={{ backgroundColor: color.bg }}
                    className={`w-5 h-5 rounded border ${node.stickyColor === color.bg ? 'border-white scale-110 shadow' : 'border-transparent'}`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    style={{ backgroundColor: color }}
                    className={`w-4 h-4 rounded-full border ${node.color === color ? 'border-white scale-110 shadow' : 'border-transparent'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Solid Fill Toggle for shapes */}
          {(node.type === 'rectangle' || node.type === 'circle' || node.type === 'diamond') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400">Fill</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFillChange('none')}
                  className={`px-2 py-0.5 text-[9px] rounded border ${node.fill === 'none' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 text-slate-400'}`}
                >
                  Outline
                </button>
                <button
                  onClick={() => handleFillChange(node.color)}
                  className={`px-2 py-0.5 text-[9px] rounded border ${node.fill !== 'none' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 text-slate-400'}`}
                >
                  Solid
                </button>
              </div>
            </div>
          )}

          {/* Z-Index Controls */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400">Arrangement</label>
            <div className="flex gap-2">
              <button
                onClick={() => bringToFront(node.id)}
                className="flex-1 text-center py-1 text-[9px] rounded border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
              >
                Front
              </button>
              <button
                onClick={() => sendToBack(node.id)}
                className="flex-1 text-center py-1 text-[9px] rounded border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
