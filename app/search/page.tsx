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
        const response = await fetch("/data/movies.json")
        const fetchedMovies: Movie[] = await response.json()
        
        if (query) {
          performSearch(fetchedMovies, query)
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error fetching movies:", error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [query])

  const performSearch = (moviesList: Movie[], searchQuery: string) => {
    const normalizedQuery = searchQuery.toLowerCase().trim()
    
    const results = moviesList.filter(movie => {
      // Search in title
      if (movie.title.toLowerCase().includes(normalizedQuery)) {
        return true
      }
      
      // Search in overview
      if (movie.overview && movie.overview.toLowerCase().includes(normalizedQuery)) {
        return true
      }
      
      // Search in genres
      if (movie.genres && movie.genres.some(genre => {
        const genreName = typeof genre === 'string' ? genre : genre.name
        return genreName.toLowerCase().includes(normalizedQuery)
      })) {
        return true
      }
      
      // Search in cast
      if (movie.cast && movie.cast.some(actor => 
        actor.toLowerCase().includes(normalizedQuery)
      )) {
        return true
      }
      
      // Search in crew
      if (movie.crew && movie.crew.some(member => 
        member.toLowerCase().includes(normalizedQuery)
      )) {
        return true
      }
      
      return false
    })
    
    setSearchResults(results)
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