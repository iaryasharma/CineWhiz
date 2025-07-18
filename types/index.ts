// types/index.ts

export interface Movie {
  id: number;
  title: string;
  overview: string;
  genres?: string[] | Genre[];
  keywords?: string[];
  cast?: string[];
  crew?: string[];
  tagline?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
  poster_path?: string;
  backdrop_path?: string;
  original_language?: string;
  original_title?: string;
  popularity?: number;
  adult?: boolean;
  video?: boolean;
  genre_ids?: number[];
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
  status?: string;
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: Video[];
  };
  similar?: {
    results: Movie[];
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  iso_639_1: string;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
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
