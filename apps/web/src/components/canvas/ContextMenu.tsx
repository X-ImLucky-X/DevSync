import React, { useEffect, useRef } from 'react';
import { CanvasNode } from './types';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onLockToggle: (id: string) => void;
  node: CanvasNode | null;
  isOwner: boolean;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onLockToggle,
  node,
  isOwner,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Prevent default context menu inside the menu itself
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const itemClass = "w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-blue-600 hover:text-white rounded transition-colors flex items-center justify-between";

  return (
    <div
      ref={menuRef}
      onContextMenu={handleContextMenu}
      style={{ top: y, left: x }}
      className="absolute bg-[#0f131a]/95 border border-slate-800/80 rounded-xl shadow-2xl p-1.5 z-50 min-w-[140px] select-none backdrop-blur-md"
    >
      {node ? (
        <>
          <button
            onClick={() => { onDuplicate(node.id); onClose(); }}
            className={itemClass}
          >
            <span>Duplicate</span>
            <span className="text-[10px] text-slate-500">Ctrl+D</span>
          </button>
          
          <div className="h-px bg-slate-800/60 my-1" />
          
          {isOwner ? (
            <>
              <button
                onClick={() => { onBringToFront(node.id); onClose(); }}
                className={itemClass}
              >
                Bring to Front
              </button>
              <button
                onClick={() => { onSendToBack(node.id); onClose(); }}
                className={itemClass}
              >
                Send to Back
              </button>
              
              <div className="h-px bg-slate-800/60 my-1" />

              <button
                onClick={() => { onLockToggle(node.id); onClose(); }}
                className={itemClass}
              >
                {node.locked ? 'Unlock Element' : 'Lock Element'}
              </button>
              
              <div className="h-px bg-slate-800/60 my-1" />
              
              <button
                onClick={() => { onDelete(node.id); onClose(); }}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-600/20 hover:text-rose-400 rounded transition-colors flex items-center justify-between"
              >
                Delete
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 text-[10px] text-slate-500 italic">
              Created by {node.createdBy}
            </div>
          )}
        </>
      ) : (
        <div className="px-3 py-1.5 text-[10px] text-slate-500 italic">
          No element selected
        </div>
      )}
    </div>
  );
}
