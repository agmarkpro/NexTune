import { Suggestion, Song, SearchOptions } from '../types/music';

// Custom error classes for better error handling
class CorsNotActivatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorsNotActivatedError';
  }
}

class ApiResponseFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiResponseFormatError';
  }
}

// Multiple CORS proxy services for automatic fallback
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest='
];

const CHOSIC_PLAYLIST_URL = 'https://www.chosic.com/playlist-generator/';

// Track which proxy is currently working
let workingProxyIndex = 0;

// Mock data for when all proxies fail
const mockSuggestions: Record<string, Suggestion[]> = {
  'song': [
    { value: 'Bohemian Rhapsody', label: 'Bohemian Rhapsody - Queen' },
    { value: 'Imagine', label: 'Imagine - John Lennon' },
    { value: 'Hotel California', label: 'Hotel California - Eagles' },
    { value: 'Stairway to Heaven', label: 'Stairway to Heaven - Led Zeppelin' },
    { value: 'Sweet Child O Mine', label: 'Sweet Child O Mine - Guns N Roses' },
    { value: 'Yesterday', label: 'Yesterday - The Beatles' },
    { value: 'Smells Like Teen Spirit', label: 'Smells Like Teen Spirit - Nirvana' },
    { value: 'Billie Jean', label: 'Billie Jean - Michael Jackson' },
    { value: 'Like a Rolling Stone', label: 'Like a Rolling Stone - Bob Dylan' },
    { value: 'Purple Haze', label: 'Purple Haze - Jimi Hendrix' }
  ],
  'artist': [
    { value: 'The Beatles', label: 'The Beatles' },
    { value: 'Queen', label: 'Queen' },
    { value: 'Led Zeppelin', label: 'Led Zeppelin' },
    { value: 'Pink Floyd', label: 'Pink Floyd' },
    { value: 'The Rolling Stones', label: 'The Rolling Stones' },
    { value: 'Michael Jackson', label: 'Michael Jackson' },
    { value: 'Nirvana', label: 'Nirvana' },
    { value: 'Bob Dylan', label: 'Bob Dylan' },
    { value: 'Jimi Hendrix', label: 'Jimi Hendrix' },
    { value: 'Elvis Presley', label: 'Elvis Presley' }
  ]
};

const mockPlaylistData: Song[] = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    youtubeId: 'fJ9rUzIMcZQ'
  },
  {
    id: '2',
    title: 'Imagine',
    artist: 'John Lennon',
    youtubeUrl: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
    youtubeId: 'YkgkThdzX-8'
  },
  {
    id: '3',
    title: 'Hotel California',
    artist: 'Eagles',
    youtubeUrl: 'https://www.youtube.com/watch?v=BciS5krYL80',
    youtubeId: 'BciS5krYL80'
  },
  {
    id: '4',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    youtubeUrl: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
    youtubeId: 'QkF3oxziUI4'
  },
  {
    id: '5',
    title: 'Sweet Child O Mine',
    artist: 'Guns N Roses',
    youtubeUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
    youtubeId: '1w7OgIMMRc4'
  },
  {
    id: '6',
    title: 'Yesterday',
    artist: 'The Beatles',
    youtubeUrl: 'https://www.youtube.com/watch?v=NrgmdOz227I',
    youtubeId: 'NrgmdOz227I'
  },
  {
    id: '7',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    youtubeUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
    youtubeId: 'hTWKbfoikeg'
  },
  {
    id: '8',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    youtubeUrl: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
    youtubeId: 'Zi_XLOBDo_Y'
  },
  {
    id: '9',
    title: 'Like a Rolling Stone',
    artist: 'Bob Dylan',
    youtubeUrl: 'https://www.youtube.com/watch?v=IwOfCgkyEj0',
    youtubeId: 'IwOfCgkyEj0'
  },
  {
    id: '10',
    title: 'Purple Haze',
    artist: 'Jimi Hendrix',
    youtubeUrl: 'https://www.youtube.com/watch?v=WGoDaYjdfSg',
    youtubeId: 'WGoDaYjdfSg'
  }
];

async function tryWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
  let lastError: Error | null = null;

  // Try each proxy starting from the last working one
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxyIndex = (workingProxyIndex + i) % CORS_PROXIES.length;
    const proxy = CORS_PROXIES[proxyIndex];
    
    try {
      const proxiedUrl = `${proxy}${encodeURIComponent(url)}`;
      const response = await fetch(proxiedUrl, {
        ...options,
        headers: {
          'Accept': 'application/json, text/html, */*',
          ...options.headers,
        },
      });

      if (response.ok) {
        // Update working proxy index for future requests
        workingProxyIndex = proxyIndex;
        return response;
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`Proxy ${proxy} failed:`, error);
    }
  }

  // If all proxies failed, throw the last error
  throw lastError || new Error('All CORS proxies failed');
}

async function isValidJsonResponse(response: Response): Promise<boolean> {
  const contentType = response.headers.get('content-type');
  return contentType !== null && contentType.includes('application/json');
}

export function activateCorsProxy(): void {
  // Open AllOrigins demo page
  window.open('https://allorigins.win/', '_blank', 'noopener,noreferrer');
}

export async function getSuggestions(query: string, type: string): Promise<Suggestion[]> {
  if (query.length < 2) return [];

  try {
    // Use the playlist generator page to get suggestions by simulating the search
    const searchUrl = `${CHOSIC_PLAYLIST_URL}?q=${encodeURIComponent(query)}&type=${type}`;
    
    const response = await tryWithProxy(searchUrl);
    const html = await response.text();
    
    // Parse suggestions from the HTML response
    const suggestions = parseSuggestionsFromHtml(html, query, type);
    
    if (suggestions.length === 0) {
      throw new ApiResponseFormatError('No suggestions found in response');
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    
    // Return filtered mock data based on query
    const suggestions = mockSuggestions[type] || [];
    return suggestions.filter(s => 
      s.value.toLowerCase().includes(query.toLowerCase()) ||
      s.label.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function generatePlaylist(options: SearchOptions): Promise<Song[]> {
  try {
    let url = CHOSIC_PLAYLIST_URL;
    
    if (options.type === 'genre' || options.type === 'category') {
      url += `?genre=${encodeURIComponent(options.genre || options.query)}`;
    } else {
      url += `?q=${encodeURIComponent(options.query)}&type=${options.type}`;
    }

    const response = await tryWithProxy(url);
    const html = await response.text();
    
    // Try to parse the HTML response
    const songs = parseMusicFromHtml(html);
    
    // If no songs were parsed, it might be an error page
    if (songs.length === 0) {
      throw new ApiResponseFormatError('No songs found in API response');
    }
    
    return songs;
  } catch (error) {
    console.error('Error generating playlist:', error);
    
    // Return mock data that matches the search query
    return mockPlaylistData.filter(song => {
      const searchTerm = options.query.toLowerCase();
      return song.title.toLowerCase().includes(searchTerm) ||
             song.artist.toLowerCase().includes(searchTerm);
    }).slice(0, 10); // Limit to 10 results
  }
}

function parseSuggestionsFromHtml(html: string, query: string, type: string): Suggestion[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for suggestions in various possible containers
    const suggestionSelectors = [
      '#form-suggestions .span-class',
      '#form-suggestions span',
      '.span-class',
      '.suggestion-item'
    ];
    
    const suggestions: Suggestion[] = [];
    
    for (const selector of suggestionSelectors) {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent?.trim();
        if (text) {
          // Extract song title and artist from the text content
          const cleanText = text.replace(/\s+/g, ' ').trim();
          suggestions.push({
            value: cleanText,
            label: cleanText
          });
        }
      });
      
      if (suggestions.length > 0) break;
    }
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  } catch (error) {
    console.error('Error parsing suggestions from HTML:', error);
    return [];
  }
}

function parseMusicFromHtml(html: string): Song[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Multiple selectors to try for different page layouts
    const musicSelectors = [
      '.pl-item',
      '.playlist-item',
      '.song-item',
      '.track-item',
      '[data-song]'
    ];
    
    const songs: Song[] = [];

    for (const selector of musicSelectors) {
      const musicItems = doc.querySelectorAll(selector);
      
      musicItems.forEach((item, index) => {
        const titleElement = item.querySelector('.song-title, .title, h3, h4');
        const artistElement = item.querySelector('.artist-name, .artist, .by');
        const youtubeLinkElement = item.querySelector('a[href*="youtube.com"], a[href*="youtu.be"]');

        if (titleElement && artistElement) {
          const title = titleElement.textContent?.trim() || '';
          const artist = artistElement.textContent?.trim() || '';
          
          let youtubeUrl = '';
          let youtubeId = '';
          
          if (youtubeLinkElement) {
            youtubeUrl = youtubeLinkElement.getAttribute('href') || '';
            const youtubeIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : '';
          }

          if (title && artist) {
            songs.push({
              id: `${index}-${youtubeId || Date.now()}`,
              title,
              artist,
              youtubeUrl: youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`,
              youtubeId: youtubeId || '',
            });
          }
        }
      });
      
      if (songs.length > 0) break;
    }

    return songs;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}