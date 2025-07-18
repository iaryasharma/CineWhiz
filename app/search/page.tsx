// app/search/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { Movie } from "@/types"
import MovieDetail from "@/components/MovieDetail"
import MovieGrid from "@/components/MovieGrid"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        
        if (query) {
          // Search movies using TMDB API
          const response = await fetch(`/api/tmdb?query=${encodeURIComponent(query)}`)
          const data = await response.json()
          setSearchResults(data.results || [])
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error searching movies:", error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [query])

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
    <div className="min-h-screen bg-black text-white">
      <div className="pt-24 pb-16 px-8 md:px-20 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          {query ? (
            <>Search results for: <span className="text-red-600">&ldquo;{query}&rdquo;</span></>
          ) : (
            "Search for movies"
          )}
        </h1>
        
        {query && (
          <p className="mb-8 text-gray-400">
            Found {searchResults.length} {searchResults.length === 1 ? "result" : "results"}
          </p>
        )}
        
        {searchResults.length > 0 ? (
          <MovieGrid
            title="Search Results"
            movies={searchResults}
            onMovieClick={openMovieDetail}
          />
        ) : query ? (
          <div className="mt-16 text-center">
            <p className="text-gray-400 text-lg">No movies found matching &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-gray-400 text-lg">Enter a search term to find movies</p>
          </div>
        )}
      </div>

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

// Loading fallback component
function SearchLoading() {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}