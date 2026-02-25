"use client";
import { useState } from "react";

interface VideoPlayerProps {
  title: string;
  description?: string;
  /** YouTube video ID or full YouTube URL */
  videoId: string;
  duration?: string;
  allowCustomUrl?: boolean;
}

function extractId(videoId: string): string {
  const match = videoId.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : videoId;
}

export default function VideoPlayer({ title, description, videoId, duration, allowCustomUrl }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [editing, setEditing] = useState(false);
  const [committed, setCommitted] = useState(videoId);

  const id = extractId(committed);
  const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = customUrl.trim();
    if (trimmed) {
      setCommitted(trimmed);
      setPlaying(false);
    }
    setEditing(false);
    setCustomUrl("");
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="relative aspect-video bg-slate-900 cursor-pointer group" onClick={() => !editing && setPlaying(true)}>
        {playing ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {duration && (
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                {duration}
              </span>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-3">
        <p className="font-semibold text-slate-800 text-sm">{title}</p>
        {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}

        {allowCustomUrl && (
          <div className="mt-2">
            {editing ? (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Paste YouTube URL or video ID"
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setCustomUrl(""); }}
                  className="text-xs text-slate-500 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Change video URL
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
