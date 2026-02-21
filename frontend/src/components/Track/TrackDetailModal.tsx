import { X, Play, Pause, Volume2, VolumeX, Download, Share2, PlusSquare } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TipModal } from "./TipModal";

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // seconds
  coverUrl: string;
  audioUrl: string;
  allowDownload?: boolean;
}

interface TrackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: TrackInfo;
}

export function TrackDetailModal({ isOpen, onClose, track }: TrackDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Focus trap: keep focus inside modal when open
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const focusable = () => {
      if (!dialog) return [] as HTMLElement[];
      const nodes = dialog.querySelectorAll<HTMLElement>(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter((el) => !el.hasAttribute("disabled"));
    };
    const firstFocus = focusable()[0];
    firstFocus?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "Tab") {
        const els = focusable();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Swipe down to close on mobile
  useEffect(() => {
    if (!isOpen) return;
    let startY = 0;
    let moved = false;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      moved = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = e.touches[0].clientY - startY;
      if (dy > 10) moved = true;
      const panel = dialogRef.current;
      if (panel) panel.style.transform = `translateY(${Math.max(0, dy)}px)`;
    };
    const onTouchEnd = () => {
      const panel = dialogRef.current;
      if (!panel) return;
      const translateY = parseFloat(panel.style.transform.replace(/[^0-9.]/g, "")) || 0;
      if (moved && translateY > 80) {
        onClose();
      }
      panel.style.transform = "";
    };

    const el = dialogRef.current;
    el?.addEventListener("touchstart", onTouchStart, { passive: true });
    el?.addEventListener("touchmove", onTouchMove, { passive: true });
    el?.addEventListener("touchend", onTouchEnd);
    return () => {
      el?.removeEventListener("touchstart", onTouchStart as any);
      el?.removeEventListener("touchmove", onTouchMove as any);
      el?.removeEventListener("touchend", onTouchEnd as any);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnd = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [isOpen]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    const audio = audioRef.current;
    if (audio) audio.volume = v;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const fmt = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" role="dialog" aria-modal="true" aria-labelledby="track-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        data-testid="track-detail-panel"
        className="relative w-full md:max-w-3xl bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="absolute top-3 right-3 z-10">
          <button aria-label="Close modal" onClick={onClose} className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md">
            <X size={22} />
          </button>
        </div>

        {/* Body: cover + meta + controls */}
        <div className="grid md:grid-cols-2">
          {/* Cover art */}
          <div className="relative aspect-square bg-black/5">
            <img src={track.coverUrl} alt={`${track.title} cover`} className="w-full h-full object-cover" />
          </div>

          {/* Details and controls */}
          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div>
              <h2 id="track-title" className="text-xl md:text-2xl font-bold">{track.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{track.artist} • {track.genre} • {fmt(track.duration)}</p>
            </div>

            {/* Player controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={track.duration}
                    step={0.1}
                    value={currentTime}
                    onChange={onSeek}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{fmt(currentTime)}</span>
                    <span>{fmt(track.duration)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={onVolume} className="w-32 accent-purple-600" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowTip(true)} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Tip
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2" onClick={() => navigator.share?.({ title: track.title, text: `${track.title} by ${track.artist}`, url: window.location.href })}>
                <Share2 size={18} /> Share
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <PlusSquare size={18} /> Add to playlist
              </button>
              {track.allowDownload && (
                <a className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2" href={track.audioUrl} download>
                  <Download size={18} /> Download
                </a>
              )}
            </div>

            {/* Comments preview */}
            <div className="mt-2">
              <p className="text-sm font-semibold mb-2">Comments</p>
              <div className="space-y-2 max-h-32 overflow-auto pr-1">
                {/* Placeholder comments; integrate with real data source later */}
                {["Love this drop!", "Beat is fire 🔥", "Replay on loop"].map((c, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <audio ref={audioRef} src={track.audioUrl} preload="metadata" />
      </div>

      <TipModal isOpen={showTip} onClose={() => setShowTip(false)} onConfirm={() => setShowTip(false)} />
    </div>
  );
}