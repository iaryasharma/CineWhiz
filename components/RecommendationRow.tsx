"use client"

import { useState, useEffect, useRef } from "react"
import MovieCard from "./MovieCard"
import type { Movie } from "@/types"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid"

interface RecommendationRowProps {
  movieId: number
  movieTitle: string
}

export default function RecommendationRow({ movieId, movieTitle }: RecommendationRowProps) {
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Check if API URL is defined
        const apiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
        if (!apiUrl) {
          console.error("NEXT_PUBLIC_FASTAPI_URL is not defined")
          setError("API URL not configured")
          setLoading(false)
          return
        }

        // Ensure URL doesn't have double slashes
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl

        const response = await fetch(
          `${baseUrl}/recommend?title=${encodeURIComponent(movieTitle)}`,
          {
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data && data.recommended) {
          // Fetch full movie data for each recommended title
          const recommendedTitles = data.recommended

          try {
            // Fetch movies.json
            const moviesResponse = await fetch("/data/movies.json")
            if (!moviesResponse.ok) {
              throw new Error(`Movies data error: ${moviesResponse.status}`)
            }

            const allMovies: Movie[] = await moviesResponse.json()

            // Filter movies by recommended titles
            const matchedMovies = allMovies.filter((movie) => recommendedTitles.includes(movie.title))

            setRecommendations(matchedMovies)
          } catch (movieDataError) {
            console.error("Error fetching movie data:", movieDataError)
            setError("Failed to load movie details")
          }
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        setError("Failed to fetch recommendations")
      } finally {
        setLoading(false)
      }
    }

    if (movieTitle) {
      fetchRecommendations()
    } else {
      setLoading(false)
    }
  }, [movieId, movieTitle])

  const scrollLeft = () => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth
      const containerWidth = carouselRef.current.clientWidth
      
      // Scroll by a fixed amount or by container width
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
      
      // Scroll by a fixed amount or by container width
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
    
    // If we're at the end or there's nothing to scroll
    return scrollPosition >= maxScroll - 10 || maxScroll <= 0;
  }

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-medium text-white mb-4">You might also like</h3>
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
        <h3 className="text-xl font-medium text-white mb-4">You might also like</h3>
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="mt-8 relative">
      <h3 className="text-xl font-medium text-white mb-4">You might also like</h3>
      
      <div className="relative group">
        {/* Left scroll button */}
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          disabled={scrollPosition <= 0}
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>

        {/* Movie carousel */}
        <div 
          ref={carouselRef}
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recommendations.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 transition-transform hover:scale-105">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          disabled={isRightButtonDisabled()}
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>
      </div>

      {/* Indicator pills */}
      <div className="flex justify-center mt-4 space-x-2">
        {recommendations.length > 5 && [...Array(Math.ceil(recommendations.length / 5))].map((_, index) => {
          // Calculate if this dot represents the current visible section
          const currentSection = Math.floor(scrollPosition / (carouselRef.current?.clientWidth || 1))
          return (
            <div 
              key={index}
              className={`h-1 w-4 rounded-full ${currentSection === index ? 'bg-white' : 'bg-gray-600'}`}
            />
          )
        })}
      </div>
    </div>
  )
}
