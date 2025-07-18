"use client"

import { useState, useEffect } from "react"
import type { Movie } from "@/types"
import MovieCard from "@/components/MovieCard"
import MovieDetail from "@/components/MovieDetail"
import WatchlistRecommendations from "@/components/WatchlistRecommendations"
import { TrashIcon } from "@heroicons/react/24/outline"

interface WatchlistItem {
  movieId: number;
  addedAt: string;
}

export default function WatchlistPage() {
  // Remove unused watchlistItems state and just use the API response directly
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([])
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch watchlist and all movies
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch watchlist items
        const watchlistResponse = await fetch("/api/watchlist")
        
        if (!watchlistResponse.ok) {
          throw new Error(`Watchlist API error: ${watchlistResponse.status}`)
        }
        
        const watchlistData = await watchlistResponse.json()
        
        // Fetch all movies for recommendations (still using local data for recommendations)
        const moviesResponse = await fetch("/data/movies.json")
        
        if (!moviesResponse.ok) {
          throw new Error(`Movies data error: ${moviesResponse.status}`)
        }
        
        const allMoviesData: Movie[] = await moviesResponse.json()
        
        setAllMovies(allMoviesData)
        
        // Match watchlist items with movie data
        if (watchlistData.watchlist?.length > 0) {
          const movieIds = watchlistData.watchlist.map((item: WatchlistItem) => parseInt(String(item.movieId)))
          
          // First try to get movies from local data
          const localMovies = allMoviesData.filter(movie => movieIds.includes(movie.id))
          
          // For any missing movies, fetch from TMDB
          const missingIds = movieIds.filter((id: number) => !localMovies.some(movie => movie.id === id))
          const tmdbMovies = []
          
          for (const id of missingIds) {
            try {
              const tmdbResponse = await fetch(`/api/tmdb/${id}`)
              if (tmdbResponse.ok) {
                const tmdbMovie = await tmdbResponse.json()
                tmdbMovies.push(tmdbMovie)
              }
            } catch (error) {
              console.error(`Error fetching TMDB movie ${id}:`, error)
            }
          }
          
          setWatchlistMovies([...localMovies, ...tmdbMovies])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load watchlist")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const removeFromWatchlist = async (movieId: number) => {
    try {
      const response = await fetch(`/api/watchlist?movieId=${movieId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      // Just remove from the movies state since we're not tracking watchlistItems separately
      setWatchlistMovies(prev => prev.filter(movie => movie.id !== movieId))
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  const openMovieDetail = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const closeMovieDetail = () => {
    setIsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-8 md:px-16 py-24">
      <h1 className="text-4xl font-bold mb-12">My Watchlist</h1>
      
      {error && (
        <div className="bg-red-900 bg-opacity-50 p-4 rounded-md mb-8">
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      {/* Watchlist Items */}
      {watchlistMovies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Your watchlist is empty</p>
          <p className="text-gray-500 mt-4">Add movies to your watchlist to keep track of what you want to watch</p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-medium mb-6">My List ({watchlistMovies.length})</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchlistMovies.map((movie) => (
                <div key={movie.id} className="relative group">
                  <div 
                    className="cursor-pointer transition-transform hover:scale-105" 
                    onClick={() => openMovieDetail(movie)}
                  >
                    <MovieCard movie={movie} />
                  </div>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWatchlist(movie.id)}
                    className="absolute top-2 right-2 bg-black bg-opacity-70 hover:bg-opacity-90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from watchlist"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Watchlist Recommendations - only shown if watchlist is not empty */}
          <WatchlistRecommendations 
            watchlistMovies={watchlistMovies.map(movie => movie.id)} 
            allMovies={allMovies}
            onMovieClick={openMovieDetail}
          />
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
  )
}