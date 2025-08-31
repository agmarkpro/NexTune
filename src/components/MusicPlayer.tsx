import React from 'react';
import { Song } from '../types/music';
import { createYouTubeEmbedUrl } from '../utils/youtube';

interface MusicPlayerProps {
  currentSong: Song | null;
  onClose: () => void;
}

export function MusicPlayer({ currentSong, onClose }: MusicPlayerProps) {
  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl mx-auto overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white">{currentSong.title}</h3>
            <p className="text-gray-400">{currentSong.artist}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="aspect-video">
          <iframe
            src={createYouTubeEmbedUrl(currentSong.youtubeId)}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${currentSong.title} by ${currentSong.artist}`}
          />
        </div>
      </div>
    </div>
  );
}