"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import type { Movie } from "@/types"
import MovieSlider from "@/components/MovieSlider"
import MovieDetail from "@/components/MovieDetail"
import { InformationCircleIcon } from "@heroicons/react/24/solid"
import WatchlistButton from "@/components/WatchlistButton"

export default function HomePage() {
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [trendingInIndiaMovies, setTrendingInIndiaMovies] = useState<Movie[]>([])
  const [actionThrillerMovies, setActionThrillerMovies] = useState<Movie[]>([])
  const [adventureMovies, setAdventureMovies] = useState<Movie[]>([])
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([])
  const [animatedMovies, setAnimatedMovies] = useState<Movie[]>([])
  const [horrorMovies, setHorrorMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [featuredPosterUrl, setFeaturedPosterUrl] = useState<string | null>(null)
  const [featuredMoviePool, setFeaturedMoviePool] = useState<Movie[]>([])
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        
        // Fetch trending movies from TMDB
        const trendingResponse = await fetch('/api/tmdb?category=trending&time_window=day')
        const trendingData = await trendingResponse.json()
        setTrendingMovies(trendingData.results || [])
        
        // Fetch trending in India (use discover with Indian origin country)
        const indiaResponse = await fetch('/api/tmdb?category=discover&with_origin_country=IN&sort_by=popularity.desc')
        const indiaData = await indiaResponse.json()
        setTrendingInIndiaMovies(indiaData.results || [])
        
        // Fetch popular movies for general pool
        const popularResponse = await fetch('/api/tmdb?category=popular&page=1')
        const popularData = await popularResponse.json()
        setAllMovies(popularData.results || [])
        
        // Fetch genres to get IDs
        const genresResponse = await fetch('/api/genres')
        const genresData = await genresResponse.json()
        const genres = genresData.genres || []
        
        // Find specific genre IDs
        const actionGenre = genres.find((g: Record<string, unknown>) => g.name === 'Action')
        const thrillerGenre = genres.find((g: Record<string, unknown>) => g.name === 'Thriller')
        const adventureGenre = genres.find((g: Record<string, unknown>) => g.name === 'Adventure')
        const comedyGenre = genres.find((g: Record<string, unknown>) => g.name === 'Comedy')
        const animationGenre = genres.find((g: Record<string, unknown>) => g.name === 'Animation')
        const horrorGenre = genres.find((g: Record<string, unknown>) => g.name === 'Horror')
        
        // Fetch Action & Thriller movies (combine both genres)
        if (actionGenre && thrillerGenre) {
          const actionThrillerResponse = await fetch(`/api/tmdb?category=discover&with_genres=${actionGenre.id},${thrillerGenre.id}`)
          const actionThrillerData = await actionThrillerResponse.json()
          setActionThrillerMovies(actionThrillerData.results || [])
        } else if (actionGenre) {
          const actionResponse = await fetch(`/api/tmdb?category=discover&with_genres=${actionGenre.id}`)
          const actionData = await actionResponse.json()
          setActionThrillerMovies(actionData.results || [])
        }
        
        // Fetch adventure movies
        if (adventureGenre) {
          const adventureResponse = await fetch(`/api/tmdb?category=discover&with_genres=${adventureGenre.id}`)
          const adventureData = await adventureResponse.json()
          setAdventureMovies(adventureData.results || [])
        }
        
        // Fetch comedy movies
        if (comedyGenre) {
          const comedyResponse = await fetch(`/api/tmdb?category=discover&with_genres=${comedyGenre.id}`)
          const comedyData = await comedyResponse.json()
          setComedyMovies(comedyData.results || [])
        }
        
        // Fetch animated movies
        if (animationGenre) {
          const animatedResponse = await fetch(`/api/tmdb?category=discover&with_genres=${animationGenre.id}`)
          const animatedData = await animatedResponse.json()
          setAnimatedMovies(animatedData.results || [])
        }
        
        // Fetch horror movies
        if (horrorGenre) {
          const horrorResponse = await fetch(`/api/tmdb?category=discover&with_genres=${horrorGenre.id}`)
          const horrorData = await horrorResponse.json()
          setHorrorMovies(horrorData.results || [])
        }

        // Set featured movie from trending (random 5 from top 20)
        if (trendingData.results && trendingData.results.length > 0) {
          // Get top 20 trending movies
          const top20Movies = trendingData.results.slice(0, Math.min(20, trendingData.results.length))
          
          // Shuffle and select 5 random movies from top 20
          const shuffled = [...top20Movies].sort(() => Math.random() - 0.5)
          const featuredPool = shuffled.slice(0, 5)
          setFeaturedMoviePool(featuredPool)
          
          // Start with the first movie from the random selection (index 0)
          setCurrentFeaturedIndex(0)
          
          const featuredMovie = featuredPool[0]
          setSelectedMovie(featuredMovie)
          
          // Set featured poster/backdrop
          if (featuredMovie.backdrop_path) {
            setFeaturedPosterUrl(`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`)
          } else if (featuredMovie.poster_path) {
            setFeaturedPosterUrl(`https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}`)
          }
        }
        
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Function to handle featured movie pagination
  const goToFeaturedMovie = useCallback((index: number) => {
    if (featuredMoviePool.length > 0 && index >= 0 && index < featuredMoviePool.length) {
      setCurrentFeaturedIndex(index)
      const featuredMovie = featuredMoviePool[index]
      setSelectedMovie(featuredMovie)
      
      // Update poster/backdrop
      if (featuredMovie.backdrop_path) {
        setFeaturedPosterUrl(`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`)
      } else if (featuredMovie.poster_path) {
        setFeaturedPosterUrl(`https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}`)
      }
    }
  }, [featuredMoviePool])

  const nextFeaturedMovie = useCallback(() => {
    const nextIndex = (currentFeaturedIndex + 1) % featuredMoviePool.length
    goToFeaturedMovie(nextIndex)
  }, [currentFeaturedIndex, featuredMoviePool.length, goToFeaturedMovie])

  const prevFeaturedMovie = useCallback(() => {
    const prevIndex = currentFeaturedIndex === 0 ? featuredMoviePool.length - 1 : currentFeaturedIndex - 1
    goToFeaturedMovie(prevIndex)
  }, [currentFeaturedIndex, featuredMoviePool.length, goToFeaturedMovie])

  useEffect(() => {
    // Handle URL changes for movie detail modal
    const handlePopState = () => {
      if (!window.location.hash) {
        setIsModalOpen(false)
      }
    }

    // Handle keyboard navigation for featured movies
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && featuredMoviePool.length > 1) {
        prevFeaturedMovie()
      } else if (event.key === 'ArrowRight' && featuredMoviePool.length > 1) {
        nextFeaturedMovie()
      }
    }

    window.addEventListener("popstate", handlePopState)
    window.addEventListener("keydown", handleKeyPress)

    // Check for initial movie in URL
    if (window.location.hash) {
      const movieId = Number.parseInt(window.location.hash.substring(1))
      if (!isNaN(movieId) && allMovies.length > 0) {
        const movie = allMovies.find((m) => m.id === movieId)
        if (movie) {
          setSelectedMovie(movie)
          setIsModalOpen(true)
        }
      }
    }

    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [allMovies, featuredMoviePool, currentFeaturedIndex, nextFeaturedMovie, prevFeaturedMovie])

  // Update the movie detail URL
  useEffect(() => {
    if (selectedMovie && isModalOpen) {
      window.history.pushState(null, "", `#${selectedMovie.id}`)
    } else if (!isModalOpen) {
      window.history.pushState(null, "", window.location.pathname)
    }
  }, [selectedMovie, isModalOpen])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const openMovieDetail = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const closeMovieDetail = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Banner with Featured Movie - full height and width */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
          {featuredPosterUrl ? (
            <Image
              src={featuredPosterUrl || "/placeholder.svg"}
              alt={selectedMovie?.title || "Featured movie"}
              fill
              priority
              sizes="100vw"
              className="object-cover transition-opacity duration-1000 ease-in-out"
            />
          ) : (
            <div className="w-full h-full bg-gray-900" />
          )}
          {/* Darker gradient overlay for better Netflix look */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Featured Movie Pagination - Centered at bottom */}
        {featuredMoviePool.length > 1 && (
          <>
            {/* Left Arrow - Responsive positioning and sizing */}
            <button
              onClick={prevFeaturedMovie}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110"
              aria-label="Previous featured movie"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow - Responsive positioning and sizing */}
            <button
              onClick={nextFeaturedMovie}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110"
              aria-label="Next featured movie"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots indicator - Hidden on mobile, visible on tablet+ with responsive spacing */}
            <div className="absolute bottom-20 sm:bottom-24 md:bottom-32 lg:bottom-32 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block">
              <div className="flex items-center justify-center gap-2">
                {featuredMoviePool.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToFeaturedMovie(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                      index === currentFeaturedIndex 
                        ? 'bg-white scale-125 shadow-lg' 
                        : 'bg-white/50 hover:bg-white/80 hover:scale-110'
                    }`}
                    aria-label={`Go to featured movie ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Content with better padding */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 md:px-20 pb-16 sm:pb-24 md:pb-32 z-10 hero-content">
          {selectedMovie && (
            <div className="max-w-2xl animate-fadeIn">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 text-white transition-all duration-500">
                {selectedMovie.title}
              </h1>

              {selectedMovie.tagline && (
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 italic transition-all duration-500">
                  {selectedMovie.tagline}
                </p>
              )}

              <div className="flex items-center gap-4 mb-4">
                {selectedMovie.vote_average && (
                  <span className="inline-flex items-center justify-center bg-yellow-500 text-white font-bold px-3 py-1 rounded">
                    {selectedMovie.vote_average.toFixed(1)}
                  </span>
                )}
                {selectedMovie.release_date && (
                  <span className="text-gray-300">{new Date(selectedMovie.release_date).getFullYear()}</span>
                )}
                {selectedMovie.runtime && <span className="text-gray-300">{selectedMovie.runtime} min</span>}
              </div>

              <p className="mb-8 text-sm sm:text-base md:text-lg text-gray-200 line-clamp-3">{selectedMovie.overview}</p>

              <div className="flex flex-wrap gap-4">
                {selectedMovie && <WatchlistButton movieId={selectedMovie.id} />}
                <button
                  onClick={() => openMovieDetail(selectedMovie)}
                  className="flex items-center gap-2 bg-gray-600/80 text-white py-2 px-6 rounded-md font-medium hover:bg-gray-500 transition"
                >
                  <InformationCircleIcon className="h-6 w-6" />
                  More Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movie Sliders with better padding and spacing */}
      <div className="relative z-20 px-4 sm:px-8 md:px-20 pb-16 -mt-16 sm:-mt-24 md:-mt-32 movies-section">
        <MovieSlider title="Trending Now" movies={trendingMovies} onMovieClick={openMovieDetail} />
        {trendingInIndiaMovies.length > 0 && (
          <MovieSlider title="Trending in India" movies={trendingInIndiaMovies} onMovieClick={openMovieDetail} />
        )}
        {actionThrillerMovies.length > 0 && (
          <MovieSlider title="Action & Thriller" movies={actionThrillerMovies} onMovieClick={openMovieDetail} />
        )}
        {adventureMovies.length > 0 && (
          <MovieSlider title="Adventure" movies={adventureMovies} onMovieClick={openMovieDetail} />
        )}
        {comedyMovies.length > 0 && (
          <MovieSlider title="Comedy" movies={comedyMovies} onMovieClick={openMovieDetail} />
        )}
        {animatedMovies.length > 0 && (
          <MovieSlider title="Animated" movies={animatedMovies} onMovieClick={openMovieDetail} />
        )}
        {horrorMovies.length > 0 && (
          <MovieSlider title="Horror" movies={horrorMovies} onMovieClick={openMovieDetail} />
        )}
      </div>

      {/* Movie Detail Modal */}
      {selectedMovie && <MovieDetail movie={selectedMovie} isOpen={isModalOpen} onClose={closeMovieDetail} />}
    </div>
  )
}
