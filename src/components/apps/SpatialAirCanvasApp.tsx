import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool,
  RotateCcw,
  Download,
  Trash2,
  Sparkles,
  Layers,
  Palette,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { spatialSound } from '../../utils/spatialSound';

export interface AirCanvasStroke {
  color: string;
  size: number;
  points: Array<{ x: number; y: number; z?: number; timestamp: number }>;
}

const PALETTE = [
  { name: 'Cyber Cyan', hex: '#00f5d4', glow: 'rgba(0, 245, 212, 0.7)' },
  { name: 'Vision Pink', hex: '#ff2a85', glow: 'rgba(255, 42, 133, 0.7)' },
  { name: 'Solar Gold', hex: '#ffd166', glow: 'rgba(255, 209, 102, 0.7)' },
  { name: 'Emerald AR', hex: '#06d6a0', glow: 'rgba(6, 214, 160, 0.7)' },
  { name: 'Laser White', hex: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)' },
  { name: 'Ultra Violet', hex: '#9d4edd', glow: 'rgba(157, 78, 221, 0.7)' },
];

export const SpatialAirCanvasApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentColor, setCurrentColor] = useState(PALETTE[0].hex);
  const [brushSize, setBrushSize] = useState<number>(6);
  const [strokes, setStrokes] = useState<AirCanvasStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [is3dOrbit, setIs3dOrbit] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const currentStrokeRef = useRef<AirCanvasStroke | null>(null);

  // Initialize sample holographic signature
  useEffect(() => {
    const defaultPoints: AirCanvasStroke = {
      color: '#00f5d4',
      size: 5,
      points: [
        { x: 120, y: 220, z: 0, timestamp: Date.now() },
        { x: 160, y: 150, z: 10, timestamp: Date.now() + 50 },
        { x: 220, y: 140, z: 25, timestamp: Date.now() + 100 },
        { x: 270, y: 190, z: 30, timestamp: Date.now() + 150 },
        { x: 320, y: 250, z: 15, timestamp: Date.now() + 200 },
        { x: 380, y: 220, z: 5, timestamp: Date.now() + 250 },
        { x: 440, y: 160, z: -10, timestamp: Date.now() + 300 },
        { x: 490, y: 200, z: -20, timestamp: Date.now() + 350 },
      ],
    };
    setStrokes([defaultPoints]);
  }, []);

  // Redraw canvas loop
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle spatial grid floor
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const allStrokes = [...strokes];
    if (currentStrokeRef.current) {
      allStrokes.push(currentStrokeRef.current);
    }

    const centerX = canvas.width / 2;
    const cosAngle = Math.cos(orbitAngle);
    const sinAngle = Math.sin(orbitAngle);

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      // Glow pass
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = stroke.size * 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      stroke.points.forEach((pt, idx) => {
        let px = pt.x;
        let py = pt.y;
        if (is3dOrbit) {
          const dx = pt.x - centerX;
          const z = pt.z || 0;
          px = centerX + dx * cosAngle - z * sinAngle;
        }
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();

      // Sharp core laser pass
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.5, stroke.size * 0.4);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      stroke.points.forEach((pt, idx) => {
        let px = pt.x;
        let py = pt.y;
        if (is3dOrbit) {
          const dx = pt.x - centerX;
          const z = pt.z || 0;
          px = centerX + dx * cosAngle - z * sinAngle;
        }
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    });
  }, [strokes, is3dOrbit, orbitAngle]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, strokes, orbitAngle, is3dOrbit]);

  // Pointer / Touch drawing handlers for direct phone touch interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    currentStrokeRef.current = {
      color: currentColor,
      size: brushSize,
      points: [{ x, y, timestamp: Date.now() }],
    };
    spatialSound.playDrawStroke(480, (x / rect.width) * 2 - 1);
    drawCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current.points.push({ x, y, timestamp: Date.now() });
    if (currentStrokeRef.current.points.length % 5 === 0) {
      const freq = 320 + (1 - y / rect.height) * 550;
      spatialSound.playDrawStroke(freq, (x / rect.width) * 2 - 1);
    }
    drawCanvas();
  };

  const handlePointerUp = () => {
    if (currentStrokeRef.current) {
      setStrokes((prev) => [...prev, currentStrokeRef.current!]);
      currentStrokeRef.current = null;
    }
    setIsDrawing(false);
    spatialSound.playPinchTap();
  };

  const clearCanvas = () => {
    setStrokes([]);
    currentStrokeRef.current = null;
    spatialSound.playPinchTap();
    drawCanvas();
  };

  const undoLastStroke = () => {
    setStrokes((prev) => prev.slice(0, -1));
    spatialSound.playPinchTap();
  };

  const downloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `spatial-art-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    spatialSound.playPinchTap();
  };

  return (
    <div className="flex flex-col h-full w-full select-none text-white overflow-hidden rounded-2xl relative bg-black/40 backdrop-blur-xl">
      {/* Top Air Canvas Control Ornament */}
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wide">Spatial Air Canvas</h2>
            <p className="text-[10px] text-white/50">Draw in 3D AR space with finger pinch or touch</p>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 border border-white/10">
          {PALETTE.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setCurrentColor(c.hex);
                spatialSound.playHover();
              }}
              style={{ backgroundColor: c.hex }}
              className={`w-4 h-4 rounded-full transition-transform ${
                currentColor === c.hex ? 'scale-125 ring-2 ring-white shadow-[0_0_10px_white]' : 'hover:scale-110'
              }`}
              title={c.name}
            />
          ))}
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/60">Width</span>
          <input
            type="range"
            min="2"
            max="18"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-16 h-1 accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIs3dOrbit((o) => !o)}
            className={`p-1.5 rounded-full border text-xs flex items-center gap-1 transition-colors ${
              is3dOrbit
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                : 'bg-white/10 border-white/10 hover:bg-white/20'
            }`}
            title="Toggle 3D Orbit depth"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px]">3D Depth</span>
          </button>
          <button
            onClick={undoLastStroke}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/80"
            title="Undo stroke"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-full bg-white/10 hover:bg-red-500/20 border border-white/10 text-red-300"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={downloadSnapshot}
            className="p-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300"
            title="Save PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Drawing Viewport */}
      <div className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          width={860}
          height={480}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full touch-none block"
        />

        {/* 3D Depth Orbit Angle Slider */}
        {is3dOrbit && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] text-white/80">3D Rotation Orbit</span>
            <input
              type="range"
              min="-1.5"
              max="1.5"
              step="0.02"
              value={orbitAngle}
              onChange={(e) => setOrbitAngle(Number(e.target.value))}
              className="w-32 h-1 accent-emerald-400 cursor-pointer"
            />
          </div>
        )}

        {/* Status prompt */}
        <div className="absolute bottom-3 left-4 text-[10px] text-white/40 pointer-events-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active strokes: {strokes.length} · Camera Pinch & Touch Ready</span>
        </div>
      </div>
    </div>
  );
};
