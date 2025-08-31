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
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.codetabs.com/v1/proxy?quest='
];

const CHOSIC_SUGGESTIONS_URL = 'https://www.chosic.com/wp-admin/admin-ajax.php';
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
    { value: 'Billie Jean', label: 'Billie Jean - Michael Jackson' }
  ],
  'artist': [
    { value: 'The Beatles', label: 'The Beatles' },
    { value: 'Queen', label: 'Queen' },
    { value: 'Led Zeppelin', label: 'Led Zeppelin' },
    { value: 'Pink Floyd', label: 'Pink Floyd' },
    { value: 'The Rolling Stones', label: 'The Rolling Stones' },
    { value: 'Michael Jackson', label: 'Michael Jackson' },
    { value: 'Nirvana', label: 'Nirvana' },
    { value: 'Bob Dylan', label: 'Bob Dylan' }
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
  // Open multiple proxy services to ensure at least one is activated
  CORS_PROXIES.forEach((proxy, index) => {
    setTimeout(() => {
      if (proxy.includes('allorigins.win')) {
        window.open('https://allorigins.win/', '_blank', 'noopener,noreferrer');
      } else if (proxy.includes('cors-anywhere.herokuapp.com')) {
        window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank', 'noopener,noreferrer');
      }
    }, index * 1000); // Stagger the opens
  });
}

export async function getSuggestions(query: string, type: string): Promise<Suggestion[]> {
  if (query.length < 2) return [];

  try {
    const formData = new FormData();
    formData.append('action', 'get_suggestions');
    formData.append('q', query);
    formData.append('type', type);

    const response = await tryWithProxy(CHOSIC_SUGGESTIONS_URL, {
      method: 'POST',
      body: formData,
    });

    // Check if response is valid JSON
    if (!(await isValidJsonResponse(response))) {
      throw new ApiResponseFormatError('API returned HTML instead of JSON. The service may be unavailable.');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
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

    // For playlist generation, we expect HTML response
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

function parseMusicFromHtml(html: string): Song[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const musicItems = doc.querySelectorAll('.pl-item');
    
    const songs: Song[] = [];

    musicItems.forEach((item, index) => {
      const titleElement = item.querySelector('.song-title');
      const artistElement = item.querySelector('.artist-name');
      const youtubeLinkElement = item.querySelector('a[href*="youtube.com"]');

      if (titleElement && artistElement && youtubeLinkElement) {
        const title = titleElement.textContent?.trim() || '';
        const artist = artistElement.textContent?.trim() || '';
        const youtubeUrl = youtubeLinkElement.getAttribute('href') || '';
        
        const youtubeIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : '';

        if (title && artist && youtubeId) {
          songs.push({
            id: `${index}-${youtubeId}`,
            title,
            artist,
            youtubeUrl,
            youtubeId,
          });
        }
      }
    });

    return songs;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}