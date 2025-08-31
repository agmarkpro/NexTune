import React from 'react';
import { Play, Music, User } from 'lucide-react';
import { Song } from '../types/music';

interface PlaylistViewProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  currentSong: Song | null;
}

export function PlaylistView({ songs, onPlaySong, currentSong }: PlaylistViewProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No songs found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-500 rounded-lg">
          <Music className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Generated Playlist</h2>
          <p className="text-gray-400">{songs.length} songs found</p>
        </div>
      </div>

      <div className="grid gap-3">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className={`group flex items-center space-x-4 p-4 rounded-lg bg-gray-800 hover:bg-gray-700 
                      transition-all duration-200 cursor-pointer ${
                        currentSong?.id === song.id ? 'ring-2 ring-green-500 bg-gray-700' : ''
                      }`}
            onClick={() => onPlaySong(song)}
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center group-hover:bg-green-500 transition-colors duration-200">
              {currentSong?.id === song.id ? (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              ) : (
                <Play className="h-5 w-5 text-gray-400 group-hover:text-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400 font-mono w-8">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate group-hover:text-green-400 transition-colors duration-200">
                    {song.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <User className="h-3 w-3" />
                    <p className="text-sm truncate">{song.artist}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Play className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}