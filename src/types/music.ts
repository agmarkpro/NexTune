export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeUrl: string;
  youtubeId: string;
}

export interface Suggestion {
  value: string;
  label: string;
  type: string;
}

export interface SearchOptions {
  query: string;
  type: 'song' | 'artist' | 'category' | 'genre' | 'playlist' | 'songUrl' | 'artistUrl';
  genre?: string;
}