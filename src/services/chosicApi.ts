import { Suggestion, Song, SearchOptions } from '../types/music';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const CHOSIC_SUGGESTIONS_URL = 'https://www.chosic.com/wp-admin/admin-ajax.php';
const CHOSIC_PLAYLIST_URL = 'https://www.chosic.com/playlist-generator/';
const CORS_DEMO_URL = 'https://allorigins.win/';

// Mock data for when CORS is not available
const mockSuggestions: Record<string, Suggestion[]> = {
  'song': [
    { value: 'Bohemian Rhapsody', label: 'Bohemian Rhapsody - Queen' },
    { value: 'Imagine', label: 'Imagine - John Lennon' },
    { value: 'Hotel California', label: 'Hotel California - Eagles' },
    { value: 'Stairway to Heaven', label: 'Stairway to Heaven - Led Zeppelin' },
    { value: 'Sweet Child O Mine', label: 'Sweet Child O Mine - Guns N Roses' }
  ],
  'artist': [
    { value: 'The Beatles', label: 'The Beatles' },
    { value: 'Queen', label: 'Queen' },
    { value: 'Led Zeppelin', label: 'Led Zeppelin' },
    { value: 'Pink Floyd', label: 'Pink Floyd' },
    { value: 'The Rolling Stones', label: 'The Rolling Stones' }
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
  }
];

async function checkCorsProxy(): Promise<boolean> {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent('https://httpbin.org/get')}`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export function activateCorsProxy(): void {
  window.open(CORS_DEMO_URL, '_blank', 'noopener,noreferrer');
}

export async function getSuggestions(query: string, type: string): Promise<Suggestion[]> {
  if (query.length < 2) return [];

  // Check if CORS proxy is available
  const corsAvailable = await checkCorsProxy();
  
  if (!corsAvailable) {
    // Return mock suggestions when CORS is not available
    const suggestions = mockSuggestions[type] || [];
    return suggestions.filter(s => 
      s.value.toLowerCase().includes(query.toLowerCase()) ||
      s.label.toLowerCase().includes(query.toLowerCase())
    );
  }

  try {
    const formData = new FormData();
    formData.append('action', 'get_suggestions');
    formData.append('q', query);
    formData.append('type', type);

    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(CHOSIC_SUGGESTIONS_URL)}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('CORS_NOT_ACTIVATED');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    // Fallback to mock data on error
    const suggestions = mockSuggestions[type] || [];
    return suggestions.filter(s => 
      s.value.toLowerCase().includes(query.toLowerCase()) ||
      s.label.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function generatePlaylist(options: SearchOptions): Promise<Song[]> {
  // Check if CORS proxy is available
  const corsAvailable = await checkCorsProxy();
  
  if (!corsAvailable) {
    // Return mock playlist when CORS is not available
    return mockPlaylistData;
  }

  try {
    let url = CHOSIC_PLAYLIST_URL;
    
    if (options.type === 'genre' || options.type === 'category') {
      url += `?genre=${encodeURIComponent(options.genre || options.query)}`;
    } else {
      url += `?q=${encodeURIComponent(options.query)}&type=${options.type}`;
    }

    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error('CORS_NOT_ACTIVATED');
    }

    const html = await response.text();
    return parseMusicFromHtml(html);
  } catch (error) {
    console.error('Error generating playlist:', error);
    // Fallback to mock data on error
    return mockPlaylistData;
  }
}

function parseMusicFromHtml(html: string): Song[] {
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
}