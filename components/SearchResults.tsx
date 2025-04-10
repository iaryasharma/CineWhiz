"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import MovieCard from "@/components/MovieCard"
import MovieDetail from "@/components/MovieDetail"
import type { Movie } from "@/types"

export default function SearchResults() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""
  
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setMovies([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // First try to fetch from your API if available
        const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
        
        if (apiUrl) {
          const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
          const response = await fetch(
            `${baseUrl}/search?query=${encodeURIComponent(searchQuery)}`,
            {
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )

          if (response.ok) {
            const data = await response.json()
            if (data && data.results) {
              setMovies(data.results)
              setLoading(false)
              return
            }
          }
        }
        
        // Fall back to local data if API call fails or isn't available
        const moviesResponse = await fetch("/data/movies.json")
        if (!moviesResponse.ok) {
          throw new Error(`Movies data error: ${moviesResponse.status}`)
        }

        const allMovies: Movie[] = await moviesResponse.json()
        
        // Filter movies based on search query (case insensitive)
        const query = searchQuery.toLowerCase()
        const filteredMovies = allMovies.filter((movie) => 
          movie.title.toLowerCase().includes(query) || 
          (movie.overview && movie.overview.toLowerCase().includes(query)) ||
          (movie.genres && movie.genres.some(genre => genre.toLowerCase().includes(query)))
        )
        
        setMovies(filteredMovies)
      } catch (error) {
        console.error("Error fetching search results:", error)
        setError("Failed to fetch search results. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [searchQuery])

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="pt-24 md:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
        {searchQuery ? `Search results for "${searchQuery}"` : "Search Movies"}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-900/20 p-4 rounded-md">
          {error}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-gray-400 text-center py-12">
          <p className="text-xl mb-2">No movies found</p>
          <p className="text-sm">Try adjusting your search or browse our categories</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <MovieDetail 
          movie={selectedMovie} 
          isOpen={isModalOpen} 
          onClose={closeModal} 
        />
      )}
    </div>
  )
}