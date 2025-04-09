"use client"

import { useState, useEffect, useRef } from "react"
import MovieCard from "./MovieCard"
import type { Movie } from "@/types"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid"

interface WatchlistRecommendationsProps {
  watchlistMovies: number[] // Array of movie IDs in the watchlist
  allMovies: Movie[] // All movies data
  onMovieClick: (movie: Movie) => void
}

export default function WatchlistRecommendations({ 
  watchlistMovies, 
  allMovies,
  onMovieClick 
}: WatchlistRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Don't try to fetch recommendations if there are no watchlist movies
      if (watchlistMovies.length === 0) {
        setLoading(false)
        return
      }

      try {
        // Check if API URL is defined
        const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
        if (!apiUrl) {
          console.error("NEXT_PUBLIC_FASTAPI_URL is not defined")
          setError("API URL not configured")
          setLoading(false)
          return
        }

        // Get watchlist movie titles
        const watchlistTitles = watchlistMovies
          .map(id => allMovies.find(movie => movie.id === id)?.title)
          .filter(title => title !== undefined) as string[]

        if (watchlistTitles.length === 0) {
          setLoading(false)
          return
        }

        // Ensure URL doesn't have double slashes
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl

        // Request recommendations for each movie in watchlist
        const recommendationRequests = watchlistTitles.map(title => 
          fetch(`${baseUrl}/recommend?title=${encodeURIComponent(title)}`, {
            mode: "cors",
            headers: { "Content-Type": "application/json" }
          }).then(response => {
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`)
            }
            return response.json()
          })
        )

        // Execute all requests in parallel
        const results = await Promise.all(recommendationRequests)
        
        // Collect all recommended titles
        const allRecommendedTitles = results
          .filter(data => data && data.recommended)
          .flatMap(data => data.recommended)
        
        // Count occurrences of each title
        const titleCounts = allRecommendedTitles.reduce((acc: Record<string, number>, title: string) => {
          acc[title] = (acc[title] || 0) + 1
          return acc
        }, {})

        // Sort by occurrence count (most recommended first)
        const sortedTitles = Object.keys(titleCounts).sort((a, b) => titleCounts[b] - titleCounts[a])
        
        // Get top 10 recommendations (but at least 5)
        const topRecommendations = sortedTitles.slice(0, Math.max(10, Math.min(5, sortedTitles.length)))
        
        // Filter movies that are in the watchlist already
        const watchlistMovieTitles = new Set(watchlistTitles)
        const filteredRecommendations = topRecommendations.filter(title => !watchlistMovieTitles.has(title))
        
        // Match with full movie data
        const recommendedMovies = allMovies.filter(movie => 
          filteredRecommendations.includes(movie.title)
        )
        
        // Limit to max 10
        setRecommendations(recommendedMovies.slice(0, 10))
      } catch (error) {
        console.error("Error fetching watchlist recommendations:", error)
        setError("Failed to fetch recommendations")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [watchlistMovies, allMovies])

  const scrollLeft = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth
      const scrollAmount = Math.min(containerWidth * 0.8, 300)
      const newPosition = Math.max(0, scrollPosition - scrollAmount)
      
      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
      
      setScrollPosition(newPosition)
    }
  }

  const scrollRight = () => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth
      const containerWidth = carouselRef.current.clientWidth
      const maxScroll = scrollWidth - containerWidth
      
      const scrollAmount = Math.min(containerWidth * 0.8, 300)
      const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount)
      
      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
      
      setScrollPosition(newPosition)
    }
  }

  // Update scroll position when scrolling manually
  const handleScroll = () => {
    if (carouselRef.current) {
      setScrollPosition(carouselRef.current.scrollLeft)
    }
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll)
      return () => carousel.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Calculate if the right button should be disabled
  const isRightButtonDisabled = (): boolean => {
    if (!carouselRef.current) return true;
    
    const scrollWidth = carouselRef.current.scrollWidth;
    const containerWidth = carouselRef.current.clientWidth;
    const maxScroll = scrollWidth - containerWidth;
    
    return scrollPosition >= maxScroll - 10 || maxScroll <= 0;
  }

  // Handle movie selection
  const handleMovieClick = (movie: Movie) => {
    onMovieClick(movie);
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-medium text-white mb-4">Recommended For You</h3>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-48 w-32 bg-gray-700 animate-pulse rounded-md flex-shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-medium text-white mb-4">Recommended For You</h3>
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (recommendations.length === 0 || watchlistMovies.length === 0) {
    return null
  }

  return (
    <div className="mt-8 relative">
      <h3 className="text-xl font-medium text-white mb-4">
        Recommended Based on Your Watchlist
      </h3>
      
      <div className="relative group">
        {/* Left scroll button */}
        <button 
          onClick={scrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 text-white transition-opacity ${
            scrollPosition <= 0 ? 'opacity-0 cursor-default' : 'opacity-0 group-hover:opacity-100 cursor-pointer'
          }`}
          disabled={scrollPosition <= 0}
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>

        {/* Movie carousel */}
        <div 
          ref={carouselRef}
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recommendations.map((movie) => (
            <div 
              key={movie.id} 
              className="flex-shrink-0 transition-transform hover:scale-105 cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <button 
          onClick={scrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 text-white transition-opacity ${
            isRightButtonDisabled() ? 'opacity-0 cursor-default' : 'opacity-0 group-hover:opacity-100 cursor-pointer'
          }`}
          disabled={isRightButtonDisabled()}
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Indicator pills */}
      <div className="flex justify-center mt-4 space-x-2">
        {recommendations.length > 5 && [...Array(Math.ceil(recommendations.length / 5))].map((_, index) => {
          const currentSection = Math.floor(scrollPosition / (carouselRef.current?.clientWidth || 1))
          return (
            <div 
              key={index}
              className={`h-1 w-4 rounded-full transition-colors ${currentSection === index ? 'bg-white' : 'bg-gray-600'}`}
            />
          )
        })}
      </div>
    </div>
  )
}