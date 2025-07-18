"use client"

import { useState, useEffect } from "react"
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

        // Set featured movie from trending
        if (trendingData.results && trendingData.results.length > 0) {
          // Create a pool of featured movies from top trending
          const featuredPool = trendingData.results.slice(0, 10)
          setFeaturedMoviePool(featuredPool)
          
          // Select a random movie from the pool on page load
          const randomIndex = Math.floor(Math.random() * featuredPool.length)
          setCurrentFeaturedIndex(randomIndex)
          
          const featuredMovie = featuredPool[randomIndex]
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

  // Rotate featured movie every 2 minutes
  useEffect(() => {
    if (featuredMoviePool.length === 0) return

    const rotateMovie = () => {
      const nextIndex = (currentFeaturedIndex + 1) % featuredMoviePool.length
      setCurrentFeaturedIndex(nextIndex)
      
      const nextMovie = featuredMoviePool[nextIndex]
      setSelectedMovie(nextMovie)
      
      // Update poster/backdrop
      if (nextMovie.backdrop_path) {
        setFeaturedPosterUrl(`https://image.tmdb.org/t/p/original${nextMovie.backdrop_path}`)
      } else if (nextMovie.poster_path) {
        setFeaturedPosterUrl(`https://image.tmdb.org/t/p/w500${nextMovie.poster_path}`)
      }
    }

    const interval = setInterval(rotateMovie, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [featuredMoviePool, currentFeaturedIndex])

  useEffect(() => {
    // Handle URL changes for movie detail modal
    const handlePopState = () => {
      if (!window.location.hash) {
        setIsModalOpen(false)
      }
    }

    window.addEventListener("popstate", handlePopState)

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
    }
  }, [allMovies])

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
