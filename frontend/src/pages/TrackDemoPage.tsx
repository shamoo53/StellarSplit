import { useState } from "react";
import { TrackDetailModal, type TrackInfo } from "../components/Track/TrackDetailModal";

const demoTrack: TrackInfo = {
  id: "t1",
  title: "Solar Waves",
  artist: "Olufunbi IK",
  genre: "Drips Wave",
  duration: 215,
  coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
  audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
  allowDownload: true,
};

export default function TrackDemoPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Track Detail Modal Demo</h1>
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-xl bg-purple-600 text-white">Open Modal</button>
      </div>
      <TrackDetailModal isOpen={open} onClose={() => setOpen(false)} track={demoTrack} />
    </div>
  );
}