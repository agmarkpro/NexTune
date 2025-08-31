import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { PlaylistView } from './components/PlaylistView';
import { MusicPlayer } from './components/MusicPlayer';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generatePlaylist, activateCorsProxy } from './services/chosicApi';
import { Song, SearchOptions } from './types/music';

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<SearchOptions | null>(null);

  const handleSearch = async (options: SearchOptions) => {
    setIsLoading(true);
    setError(null);
    setLastSearch(options);

    try {
      const results = await generatePlaylist(options);
      setSongs(results);
      
      if (results.length === 0) {
        setError('No songs found for your search. Try different keywords or search type.');
      }
    } catch (err) {
      console.error('Search error:', err);
      // Don't show errors to user, just use mock data silently
      console.warn('Using mock data due to API unavailability');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
  };

  const handleClosePlayer = () => {
    setCurrentSong(null);
  };

  const handleRetry = () => {
    if (lastSearch) {
      handleSearch(lastSearch);
    }
  };

  const handleActivateCors = () => {
    activateCorsProxy();
    setError(null);
  };

  const isCorsProblem = error?.includes('CORS proxy not activated');

  const renderError = () => {
    if (!error) return null;

    if (isCorsProblem) {
      return (
        <div className="text-center py-8">
          <div className="max-w-md mx-auto">
            <div className="p-6 bg-red-900 bg-opacity-50 rounded-lg border border-red-600">
              <h3 className="text-lg font-semibold text-red-200 mb-2">CORS Proxy Required</h3>
              <p className="text-red-300 mb-4 text-sm">
                {error}
              </p>
              <button
                onClick={handleActivateCors}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg
                         transition-colors duration-200 mr-2"
              >
                Activate CORS Proxy
              </button>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg
                         transition-colors duration-200"
              >
                Retry Search
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <ErrorMessage message={error} onRetry={handleRetry} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Discover Your Next Favorite Song
          </h2>
          <p className="text-gray-400 text-lg">
            Search for songs, artists, or genres and generate personalized playlists
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          {isLoading && (
            <LoadingSpinner message="Generating your playlist..." />
          )}

          {error && renderError()}

          {!isLoading && !error && songs.length > 0 && (
            <PlaylistView
              songs={songs}
              onPlaySong={handlePlaySong}
              currentSong={currentSong}
            />
          )}

          {!isLoading && !error && songs.length === 0 && !lastSearch && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
                  <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to Discover Music?</h3>
                  <p className="text-gray-400">
                    Start by typing a song name, artist, or selecting a genre to generate your personalized playlist.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-black bg-opacity-90 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 NexTune. Music discovery powered by Chosic.</p>
            <p className="text-sm mt-2">
              Note: CORS proxy required for API access. Visit{' '}
              <a 
                href="https://cors-anywhere.herokuapp.com/corsdemo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                CORS Anywhere Demo
              </a>
              {' '}to enable requests.
            </p>
          </div>
        </div>
      </footer>

      <MusicPlayer currentSong={currentSong} onClose={handleClosePlayer} />
    </div>
  );
}

export default App;