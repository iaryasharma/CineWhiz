'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Movie } from '@/types';
import Image from 'next/image';
import MovieDetail from '@/components/MovieDetail';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import MovieCard from '@/components/MovieCard';

export default function WatchlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
  const [moviePosters, setMoviePosters] = useState<Record<number, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        return;
      }

      try {
        // Get watchlist items
        const watchlistResponse = await fetch('/api/watchlist');
        if (!watchlistResponse.ok) {
          throw new Error(`API error: ${watchlistResponse.status}`);
        }
        
        const watchlistData = await watchlistResponse.json();
        const watchlistItems = watchlistData.watchlist || [];
        
        if (watchlistItems.length === 0) {
          setLoading(false);
          return;
        }
        
        // Get movie details from movies.json
        const moviesResponse = await fetch('/data/movies.json');
        const allMovies: Movie[] = await moviesResponse.json();
        
        // Filter movies by watchlist
        const movieIds = watchlistItems.map((item: any) => item.movieId);
        const watchlistMovies = allMovies.filter(movie => movieIds.includes(movie.id));
        
        setWatchlistMovies(watchlistMovies);
        
        // Fetch posters for all watchlist movies
        const posterPromises = watchlistMovies.map(async (movie) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            );
            
            if (!response.ok) {
              throw new Error(`TMDB API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.poster_path) {
              return { id: movie.id, posterPath: `https://image.tmdb.org/t/p/w500${data.poster_path}` };
            }
            
            return null;
          } catch (error) {
            console.error(`Error fetching poster for movie ${movie.id}:`, error);
            return null;
          }
        });
        
        const posterResults = await Promise.all(posterPromises);
        const posterMap: Record<number, string> = {};
        
        posterResults.forEach(result => {
          if (result) {
            posterMap[result.id] = result.posterPath;
          }
        });
        
        setMoviePosters(posterMap);
        
        // Get recommendations based on watchlist
        if (watchlistMovies.length > 0) {
          // Use the first watchlist movie for recommendations
          const firstMovie = watchlistMovies[0];
          
          try {
            const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
            if (!apiUrl) {
              throw new Error("API URL not configured");
            }
            
            const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            
            const recResponse = await fetch(
              `${baseUrl}/recommend?title=${encodeURIComponent(firstMovie.title)}`
            );
            
            if (!recResponse.ok) {
              throw new Error(`API error: ${recResponse.status}`);
            }
            
            const recData = await recResponse.json();
            
            if (recData && recData.recommended) {
              const recommendedTitles = recData.recommended;
              
              // Filter out movies already in watchlist
              const recMovies = allMovies.filter(movie => 
                recommendedTitles.includes(movie.title) && !movieIds.includes(movie.id)
              );
              
              setRecommendedMovies(recMovies);
            }
          } catch (error) {
            console.error('Error fetching recommendations:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [session, status]);

  const removeFromWatchlist = async (movieId: number) => {
    try {
      const response = await fetch(`/api/watchlist?movieId=${movieId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      setWatchlistMovies(prev => prev.filter(movie => movie.id !== movieId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const openMovieDetail = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeMovieDetail = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-8 md:px-20">
      <h1 className="text-4xl font-bold mb-8">My Watchlist</h1>
      
      {watchlistMovies.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-12 text-center shadow-xl">
          <h2 className="text-2xl mb-6">Your watchlist is empty</h2>
          <p className="mb-8 text-gray-300 max-w-lg mx-auto">Add movies to your watchlist to get personalized recommendations and watch them later.</p>
          <button 
            onClick={() => router.push('/')} 
            className="bg-red-600 text-white px-8 py-3 rounded hover:bg-red-700 transition font-medium"
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <>
          {/* Watchlist Movies - Netflix-like Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-medium mb-6">Your Watchlist</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {watchlistMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className="relative group"
                  onMouseEnter={() => setHoveredMovie(movie.id)}
                  onMouseLeave={() => setHoveredMovie(null)}
                >
                  <div className="relative h-64 rounded-md overflow-hidden transition transform group-hover:scale-105 group-hover:z-10 shadow-lg">
                    {moviePosters[movie.id] ? (
                      <Image
                        src={moviePosters[movie.id] || "/placeholder.svg"}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-gray-800 h-full w-full flex items-center justify-center p-4">
                        <p className="text-center text-sm">{movie.title}</p>
                      </div>
                    )}
                    
                    {/* Controls that appear on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4`}>
                      <h3 className="text-white font-medium truncate mb-2">{movie.title}</h3>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openMovieDetail(movie)}
                          className="p-2 bg-white rounded-full"
                        >
                          <InformationCircleIcon className="h-5 w-5 text-black" />
                        </button>
                        
                        <button
                          onClick={() => removeFromWatchlist(movie.id)}
                          className="p-2 bg-gray-700 rounded-full ml-auto"
                        >
                          <XMarkIcon className="h-5 w-5 text-white" />
                        </button>
                        
                        {movie.vote_average && (
                          <span className="bg-gray-900 text-white text-sm px-2 py-1 rounded">
                            {movie.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recommendations */}
          {watchlistMovies.length > 0 && recommendedMovies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-medium mb-6">Recommended For You</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {recommendedMovies.slice(0, 10).map(movie => (
                  <div 
                    key={movie.id} 
                    className="relative cursor-pointer"
                    onClick={() => openMovieDetail(movie)}
                  >
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Movie Detail Modal */}
      {selectedMovie && (
        <MovieDetail 
          movie={selectedMovie} 
          isOpen={isModalOpen} 
          onClose={closeMovieDetail} 
        />
      )}
    </div>
  );
}
