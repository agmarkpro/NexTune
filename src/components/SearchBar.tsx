import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { getSuggestions, activateCorsProxy } from '../services/chosicApi';
import { Suggestion, SearchOptions } from '../types/music';

interface SearchBarProps {
  onSearch: (options: SearchOptions) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchOptions['type']>('song');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');

  const debouncedQuery = useDebounce(query, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const genres = [
    'pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'country',
    'reggae', 'blues', 'funk', 'soul', 'r&b', 'indie', 'alternative', 'metal'
  ];

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length >= 2 && searchType !== 'genre' && searchType !== 'category') {
        setLoadingSuggestions(true);
        try {
          const results = await getSuggestions(debouncedQuery, searchType);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          // Silently handle suggestion errors and use mock data
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, searchType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchOptions: SearchOptions = {
      query: (searchType === 'genre' || searchType === 'category') ? selectedGenre : query,
      type: searchType,
      genre: selectedGenre,
    };

    if ((searchType === 'genre' || searchType === 'category') ? selectedGenre : query) {
      onSearch(searchOptions);
      setShowSuggestions(false);
    }
  };

  const handleActivateCors = () => {
    activateCorsProxy();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="mb-4 p-4 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-yellow-200 font-semibold mb-1">CORS Proxy Required</h3>
            <p className="text-yellow-300 text-sm">
              To search for music, you need to activate the CORS proxy first.
            </p>
          </div>
          <button
            onClick={handleActivateCors}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg
                     transition-colors duration-200 text-sm"
          >
            Activate CORS Proxy
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a song name, artist, or genre..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg 
                       bg-gray-800 text-white placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                       transition-all duration-200"
              autoComplete="off"
              disabled={(searchType === 'genre' || searchType === 'category')}
            />
            {loadingSuggestions && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
              </div>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm
                           transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion.label || suggestion.value}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchOptions['type'])}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="song">Song</option>
              <option value="artist">Artist</option>
              <option value="category">Category</option>
              <option value="genre">Genre</option>
              <option value="playlist">Playlist</option>
              <option value="songUrl">Song Link</option>
              <option value="artistUrl">Artist Link</option>
            </select>
          </div>

          {(searchType === 'genre' || searchType === 'category') && (
            <div className="flex-1">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a genre...</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!query && !selectedGenre)}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-lg
                     transition-all duration-200 transform hover:scale-105 active:scale-95
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}