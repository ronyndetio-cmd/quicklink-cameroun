import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useStore } from '../../store';

export function Lightbox() {
  const { lightbox, setLightbox } = useStore();

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  if (!lightbox) return null;

  const step = (delta: number) => {
    const next = (lightbox.index + delta + lightbox.photos.length) % lightbox.photos.length;
    setLightbox({ photos: lightbox.photos, index: next });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
      <button aria-label="Close" onClick={() => setLightbox(null)} className="absolute inset-0 cursor-default" />
      <button
        onClick={() => setLightbox(null)}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X size={20} />
      </button>

      {lightbox.photos.length > 1 && (
        <button
          onClick={() => step(-1)}
          className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-6"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <img
        src={lightbox.photos[lightbox.index]}
        alt=""
        className="a-pop relative max-h-[85vh] max-w-full rounded-xl object-contain shadow-lift"
      />

      {lightbox.photos.length > 1 && (
        <button
          onClick={() => step(1)}
          className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-6"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {lightbox.photos.length > 1 && (
        <span className="absolute bottom-5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
          {lightbox.index + 1} / {lightbox.photos.length}
        </span>
      )}
    </div>
  );
}
