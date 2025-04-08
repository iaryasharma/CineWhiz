import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function getPosterUrl(movieId: number): Promise<string | null> {
  try {
    const response = await axios.get(
      `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );
    
    if (response.data.poster_path) {
      return `https://image.tmdb.org/t/p/w500${response.data.poster_path}`;
    }
    return null;
  } catch (error) {
    console.error('Error fetching poster:', error);
    return null;
  }
}

export async function searchMovieByTitle(title: string): Promise<number | null> {
  try {
    const response = await axios.get(
      `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
    );
    
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error searching movie:', error);
    return null;
  }
}