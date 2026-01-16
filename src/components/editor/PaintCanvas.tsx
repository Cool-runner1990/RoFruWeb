'use client';

import { useRef, useEffect, useState } from 'react';
import { Undo, Redo, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PaintCanvasProps {
  imageUrl: string;
  onSave: (imageBlob: Blob) => void;
  onCancel: () => void;
}

interface DrawAction {
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

const COLORS = [
  '#DC3545', // Red
  '#1684C1', // Blue
  '#34A853', // Green
  '#F59E0B', // Orange
  '#000000', // Black
  '#FFFFFF', // White
  '#FFD700', // Yellow
  '#9C27B0', // Purple
];

export default function PaintCanvas({
  imageUrl,
  onSave,
  onCancel,
}: PaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(5);
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setIsDrawing(true);
    setCurrentAction({
      color,
      width: lineWidth,
      points: [{ x, y }],
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lastPoint = currentAction.points[currentAction.points.length - 1];
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setCurrentAction({
      ...currentAction,
      points: [...currentAction.points, { x, y }],
    });
  };

  const stopDrawing = () => {
    if (currentAction && currentAction.points.length > 1) {
      const newHistory = history.slice(0, historyStep);
      setHistory([...newHistory, currentAction]);
      setHistoryStep(newHistory.length + 1);
    }
    setIsDrawing(false);
    setCurrentAction(null);
  };

  const redrawCanvas = (actions: DrawAction[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Redraw all actions
      actions.forEach((action) => {
        if (action.points.length < 2) return;

        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        
        for (let i = 1; i < action.points.length; i++) {
          ctx.lineTo(action.points[i].x, action.points[i].y);
        }
        
        ctx.stroke();
      });
    };
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      redrawCanvas(history.slice(0, newStep));
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      redrawCanvas(history.slice(0, newStep));
    }
  };

  const handleClear = () => {
    setHistory([]);
    setHistoryStep(0);
    redrawCanvas([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="glass-card flex flex-wrap items-center gap-4 p-4">
        {/* Color Picker */}
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? 'var(--primary)' : 'var(--outline)',
              }}
              aria-label={`Farbe ${c}`}
            />
          ))}
        </div>

        {/* Line Width */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-on-surface">Größe:</label>
          <input
            type="range"
            min="2"
            max="30"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-on-surface-variant">{lineWidth}px</span>
        </div>

        {/* Actions */}
        <div className="ml-auto flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={historyStep === 0}
            aria-label="Rückgängig"
          >
            <Undo className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={historyStep === history.length}
            aria-label="Wiederholen"
          >
            <Redo className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={history.length === 0}
            aria-label="Alles löschen"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-auto rounded-xl bg-surface-variant p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="max-w-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Save/Cancel */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Speichern
        </Button>
      </div>
    </div>
  );
}
