import { useEffect } from 'react';
import { 
  MousePointer, Pencil, Square, Circle, Type, FileText, 
  Trash2, ArrowUpRight, Eraser, Minus, Diamond 
} from 'lucide-react';
import { ToolType, STICKY_COLORS, PRESET_COLORS } from './types';

interface ToolbarProps {
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  stickyBg: string;
  setStickyBg: (color: string) => void;
  onClearCanvas: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
}

export function Toolbar({
  selectedTool,
  setSelectedTool,
  selectedColor,
  setSelectedColor,
  stickyBg,
  setStickyBg,
  onClearCanvas,
  onDeleteSelected,
  hasSelection,
}: ToolbarProps) {
  // Listen for global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const activeTagName = document.activeElement?.tagName.toLowerCase();
      if (activeTagName === 'input' || activeTagName === 'textarea') return;

      switch (e.key.toLowerCase()) {
        case 'v':
          setSelectedTool('select');
          break;
        case 'p':
          setSelectedTool('pen');
          break;
        case 'r':
          setSelectedTool('rectangle');
          break;
        case 'o':
          setSelectedTool('circle');
          break;
        case 'd':
          setSelectedTool('diamond');
          break;
        case 'l':
          setSelectedTool('line');
          break;
        case 'a':
          setSelectedTool('arrow');
          break;
        case 't':
          setSelectedTool('text');
          break;
        case 's':
          setSelectedTool('sticky');
          break;
        case 'e':
          setSelectedTool('eraser');
          break;
        case 'delete':
        case 'backspace':
          onDeleteSelected();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedTool, onDeleteSelected]);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-[#101520]/90 backdrop-blur border border-slate-800/80 px-3.5 py-2 rounded-2xl shadow-xl z-10 select-none">
      <button
        onClick={() => setSelectedTool('select')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'select' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Pointer (V)"
      >
        <MousePointer className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('pen')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'pen' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Pencil (P)"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('rectangle')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'rectangle' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Rectangle (R)"
      >
        <Square className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('circle')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'circle' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Circle (O)"
      >
        <Circle className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('diamond')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'diamond' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Diamond (D)"
      >
        <Diamond className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('line')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'line' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Line (L)"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('arrow')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'arrow' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Arrow Connector (A)"
      >
        <ArrowUpRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('text')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'text' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Text Block (T)"
      >
        <Type className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('sticky')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'sticky' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Sticky Note (S)"
      >
        <FileText className="w-4 h-4" />
      </button>
      <button
        onClick={() => setSelectedTool('eraser')}
        className={`p-2 rounded-lg transition-all ${selectedTool === 'eraser' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        title="Eraser (E)"
      >
        <Eraser className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-800 mx-1.5" />

      {/* Color Presets / Sticky Colors */}
      {selectedTool !== 'sticky' ? (
        <div className="flex items-center gap-1">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{ backgroundColor: color }}
              className={`w-4.5 h-4.5 rounded-full border ${selectedColor === color ? 'border-white scale-110 shadow' : 'border-transparent hover:scale-105'}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {STICKY_COLORS.map(color => (
            <button
              key={color.bg}
              onClick={() => { setStickyBg(color.bg); setSelectedColor(color.bg); }}
              style={{ backgroundColor: color.bg }}
              className={`w-4.5 h-4.5 rounded border ${stickyBg === color.bg ? 'border-white scale-110 shadow' : 'border-transparent hover:scale-105'}`}
              title={color.name}
            />
          ))}
        </div>
      )}

      <div className="w-px h-6 bg-slate-800 mx-1.5" />

      {hasSelection && (
        <button
          onClick={onDeleteSelected}
          className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all mr-1"
          title="Delete Selection (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={onClearCanvas}
        className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
        title="Clear Board"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
