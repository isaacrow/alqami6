import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  Plus,
  Trash2,
  Radio,
  Share2,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import { spatialSound } from '../../utils/spatialSound';

export interface WorldAnchor {
  id: string;
  title: string;
  category: 'deal' | 'note' | 'landmark' | 'waypoint';
  latitude: number;
  longitude: number;
  bearingDeg: number;
  distanceMeters: number;
  timestamp: number;
}

export const SpatialWorldAnchorsApp: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'deal' | 'note' | 'landmark' | 'waypoint'>('landmark');
  const [anchors, setAnchors] = useState<WorldAnchor[]>([
    {
      id: '1',
      title: 'AR Hologram Beacon (North 0°)',
      category: 'landmark',
      latitude: 37.7749,
      longitude: -122.4194,
      bearingDeg: 0,
      distanceMeters: 4.5,
      timestamp: Date.now() - 3600000,
    },
    {
      id: '2',
      title: 'Living Room Desk Anchor',
      category: 'waypoint',
      latitude: 37.7751,
      longitude: -122.4191,
      bearingDeg: 85,
      distanceMeters: 2.1,
      timestamp: Date.now() - 1800000,
    },
    {
      id: '3',
      title: 'Exclusive AR Deal — 20% Off',
      category: 'deal',
      latitude: 37.7745,
      longitude: -122.4199,
      bearingDeg: 215,
      distanceMeters: 12.8,
      timestamp: Date.now() - 900000,
    },
  ]);

  // Read real Geolocation if available
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        () => {
          // Default fallback coordinates (Cupertino Apple Park)
          setCoords({ lat: 37.3346, lng: -122.009, accuracy: 5 });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setCoords({ lat: 37.3346, lng: -122.009, accuracy: 5 });
    }
  }, []);

  // Read real Device Compass Heading
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading for iOS Safari, e.alpha for Android/Chrome
      const heading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading ?? (e.alpha ? 360 - e.alpha : 0);
      setCompassHeading(Math.round(heading));
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, []);

  const dropCurrentAnchor = () => {
    if (!newTitle.trim()) return;
    const newAnchor: WorldAnchor = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      category: newCategory,
      latitude: coords ? coords.lat : 37.7749,
      longitude: coords ? coords.lng : -122.4194,
      bearingDeg: compassHeading,
      distanceMeters: Number((Math.random() * 3 + 1.2).toFixed(1)),
      timestamp: Date.now(),
    };
    setAnchors((prev) => [newAnchor, ...prev]);
    setNewTitle('');
    spatialSound.playAnchorDrop();
  };

  const removeAnchor = (id: string) => {
    setAnchors((prev) => prev.filter((a) => a.id !== id));
    spatialSound.playPinchTap();
  };

  const getCategoryBadge = (cat: WorldAnchor['category']) => {
    switch (cat) {
      case 'deal':
        return { label: 'AR Deal', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'waypoint':
        return { label: 'Spatial Pin', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'note':
        return { label: 'Chirp', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'landmark':
      default:
        return { label: 'Landmark', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
  };

  return (
    <div className="flex flex-col h-full w-full select-none text-white overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl">
      {/* Top Bar */}
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wide">GPS & Compass AR Anchors</h2>
            <p className="text-[10px] text-white/50">Location-based WebXR Billboards & Chirps</p>
          </div>
        </div>

        {/* Real Sensor Telemetry Capsule */}
        <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Navigation
              className="w-3.5 h-3.5 transition-transform duration-300"
              style={{ transform: `rotate(${compassHeading}deg)` }}
            />
            <span>{compassHeading}°</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="text-white/70">
            {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Scanning GPS…'}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        {/* Left Column: 360° Radar Ring & Anchor Creation */}
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center relative min-h-[220px]">
            {/* Holographic Compass Radar Ring */}
            <div className="relative w-44 h-44 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
              {/* Heading Indicator Needle */}
              <div
                className="absolute inset-0 flex items-start justify-center transition-transform duration-200"
                style={{ transform: `rotate(${compassHeading}deg)` }}
              >
                <div className="w-2.5 h-6 bg-red-500 rounded-full shadow-[0_0_12px_red]" />
              </div>

              {/* Cardinal directions */}
              <span className="absolute top-1 text-[10px] font-bold text-red-400">N</span>
              <span className="absolute right-2 text-[10px] font-bold text-white/60">E</span>
              <span className="absolute bottom-1 text-[10px] font-bold text-white/60">S</span>
              <span className="absolute left-2 text-[10px] font-bold text-white/60">W</span>

              {/* Pulsing Sonar Ring */}
              <div className="w-28 h-28 rounded-full border border-sky-400/40 animate-ping" />

              {/* Anchors on the radar */}
              {anchors.map((anc) => {
                const rad = ((anc.bearingDeg - compassHeading) * Math.PI) / 180;
                const r = Math.min(68, Math.max(20, anc.distanceMeters * 8));
                const x = 88 + r * Math.sin(rad);
                const y = 88 - r * Math.cos(rad);
                return (
                  <div
                    key={anc.id}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 border border-white shadow-[0_0_10px_#34d399] flex items-center justify-center cursor-pointer"
                    title={`${anc.title} (${anc.distanceMeters}m)`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                );
              })}

              <div className="w-5 h-5 rounded-full bg-white/90 shadow-[0_0_10px_white] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-sky-500" />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-white/60 text-center">
              360° Real-Time Spatial Radar · Phone Bearing {compassHeading}°
            </p>
          </div>

          {/* Quick Drop Input */}
          <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-semibold text-white/50 tracking-wider">
              Drop AR World Billboard
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name this spatial anchor…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && dropCurrentAnchor()}
                className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
              />
              <button
                onClick={dropCurrentAnchor}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs flex items-center gap-1 shadow-md shadow-sky-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Anchor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active World Anchors List */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-white/50 tracking-wider">
              Active Geolocation Pins ({anchors.length})
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {anchors.map((anc) => {
              const badge = getCategoryBadge(anc.category);
              return (
                <div
                  key={anc.id}
                  className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-white/10 border border-white/15 text-emerald-300 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{anc.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/50 mt-0.5 flex items-center gap-2">
                        <span>Bearing: {anc.bearingDeg}°</span>
                        <span>·</span>
                        <span>Distance: {anc.distanceMeters}m</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeAnchor(anc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-300 transition-opacity"
                    title="Remove anchor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
