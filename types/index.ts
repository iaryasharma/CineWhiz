// types/index.ts

export interface Movie {
  id: number;
  title: string;
  overview: string;
  genres: string[];
  keywords: string[];
  cast: string[];
  crew: string[];
  tagline?: string;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  poster_path?: string;
  backdrop_path?: string;
  original_language?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface WatchlistItem {
  userId: string;
  movieId: number;
  addedAt: Date;
}
