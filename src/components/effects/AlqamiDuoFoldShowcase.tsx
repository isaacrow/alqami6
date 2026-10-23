import React from 'react';
import {
  FoldCarousel,
  FoldCarouselFrame,
  FoldCarouselNext,
  FoldCarouselPrevious,
} from './fold-carousel/fold-carousel';
import { ALQAMI_ARTIFACTS, AlqamiArtifact } from '../../data/alqamiArtifacts';
import { AlqamiArtifact3DCanvas } from '../three/AlqamiArtifact3DCanvas';
import { assetUrl } from '../../utils/assetUrl';
import { spatialSound } from '../../utils/spatialSound';
import { Box, Rotate3d, Sparkles, Smartphone, Eye, ArrowLeft } from 'lucide-react';

interface AlqamiDuoFoldShowcaseProps {
  initialIndex?: number;
  onSelectArtifact?: (artifact: AlqamiArtifact) => void;
  onClose?: () => void;
  lang?: 'ar' | 'en';
}

/**
 * AlqamiDuoFoldShowcase
 * Uses the exact iPhone Duo Fold Carousel engine from Kareem-AEz/iphone-duo-fold-carousel
 * Renders authentic mechanical dual-screen folding with dynamic perspective clipping,
 * hinge hairline, lighting ramps, and bezel depth.
 */
export const AlqamiDuoFoldShowcase: React.FC<AlqamiDuoFoldShowcaseProps> = ({
  initialIndex = 0,
  onSelectArtifact,
  onClose,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  const slides = ALQAMI_ARTIFACTS.map((artifact, index) => (
    <div
      key={artifact.id}
      className="w-full h-full grid grid-cols-2 bg-gradient-to-br from-stone-900/95 via-stone-850 to-stone-950 text-white select-none relative overflow-hidden"
    >
      {/* Left Panel: 3D Studio & Focal Model */}
      <div className="relative w-full h-full flex flex-col justify-between p-6 bg-white/[0.03] border-r border-white/10">
        <div className="flex items-center justify-between z-10">
          <span className="text-[10px] font-mono tracking-wider text-amber-300 uppercase px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
            {artifact.category[isAr ? 'ar' : 'en']}
          </span>
          <span className="text-[11px] font-semibold text-white/60">
            #{String(index + 1).padStart(2, '0')} / {ALQAMI_ARTIFACTS.length}
          </span>
        </div>

        {/* 3D Model Viewport */}
        <div className="flex-1 w-full relative flex items-center justify-center my-2">
          <AlqamiArtifact3DCanvas
            glbUrl={artifact.model.glb}
            mode="card"
            autoRotate={true}
            className="w-full h-full"
          />
        </div>

        {/* Left Bottom Badges */}
        <div className="flex items-center justify-between z-10 text-[11px] text-white/70">
          <span className="font-mono text-cyan-300">{artifact.id}</span>
          <span className="text-amber-300 font-bold">${artifact.price}</span>
        </div>
      </div>

      {/* Right Panel: Curatorial Metadata, Calligraphy & Actions */}
      <div className="relative w-full h-full flex flex-col justify-between p-6 bg-black/30 backdrop-blur-md">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-amber-300 text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-serif">{isAr ? 'مقتنى تاريخي أصيل' : 'Authentic Historical Relic'}</span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-wide leading-tight">
            {isAr ? artifact.title.ar : artifact.title.en}
          </h3>
          <p className="text-xs text-white/60 leading-relaxed line-clamp-3">
            {isAr ? artifact.description.ar : artifact.description.en}
          </p>

          <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/40 block text-[9.5px]">{isAr ? 'الحقبة الزمنية' : 'Period'}</span>
              <span className="text-white/90 font-medium truncate block">{artifact.period[isAr ? 'ar' : 'en']}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/40 block text-[9.5px]">{isAr ? 'المادة والصناعة' : 'Material'}</span>
              <span className="text-white/90 font-medium truncate block">{artifact.details.material[isAr ? 'ar' : 'en']}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex items-center gap-2">
          <button
            onClick={() => {
              spatialSound.playPinchTap();
              onSelectArtifact?.(artifact);
            }}
            className="flex-1 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعراض في المتجر' : 'Inspect Details'}</span>
          </button>
          <a
            href={`${assetUrl('/immersive-ar.html')}?model=${encodeURIComponent(assetUrl(artifact.model.glb))}&title=${encodeURIComponent(isAr ? artifact.title.ar : artifact.title.en)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => spatialSound.playPinchTap()}
            className="h-9 px-3 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
            title="iPhone AR Quick Look"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 py-4">
      {/* Top Header / Mode Indicator */}
      <div className="flex items-center justify-between w-full max-w-2xl px-4 text-white">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition active:scale-95 cursor-pointer"
              title={isAr ? 'العودة للمتجر' : 'Back to Store'}
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          )}
          <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
            iPhone Duo Fold Carousel ✦ تقليب ميكانيكي ثنائي
          </span>
        </div>
        <span className="text-[11px] text-white/50">
          {isAr ? 'استخدم الأسهم للطي والتنقل' : 'Swipe or use arrows to fold'}
        </span>
      </div>

      {/* The Core Fold Carousel Frame */}
      <FoldCarousel
        slides={slides}
        defaultIndex={initialIndex}
        loop={true}
        duration={0.7}
        className="flex flex-col items-center gap-5 w-full max-w-2xl"
      >
        <FoldCarouselFrame
          variant="door"
          panelWidth="min(17rem, 42vw)"
          className="rounded-[28px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)]"
        />

        {/* Bottom Fold Navigation Arrows */}
        <div className="flex items-center gap-3">
          <FoldCarouselPrevious className="w-10 h-10 flex items-center justify-center" />
          <div className="px-4 py-1.5 rounded-full bg-black/40 border border-white/15 text-[11px] font-mono text-white/80 backdrop-blur-md">
            Fold & Turn
          </div>
          <FoldCarouselNext className="w-10 h-10 flex items-center justify-center" />
        </div>
      </FoldCarousel>
    </div>
  );
};
