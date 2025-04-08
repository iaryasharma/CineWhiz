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
  const [actionMovies, setActionMovies] = useState<Movie[]>([])
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([])
  const [dramaMovies, setDramaMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [featuredPosterUrl, setFeaturedPosterUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("/data/movies.json")
        const movies: Movie[] = await response.json()

        setAllMovies(movies)

        // Create trending (random selection)
        const shuffled = [...movies].sort(() => 0.5 - Math.random())
        const trendingSelection = shuffled.slice(0, 20)
        setTrendingMovies(trendingSelection)

        // Set a featured movie
        const featuredMovie = trendingSelection[0]
        setSelectedMovie(featuredMovie)

        // Fetch the poster for the featured movie
        await fetchFeaturedPoster(featuredMovie)

        // Filter by genres
        setActionMovies(movies.filter((movie) => movie.genres && movie.genres.includes("Action")).slice(0, 20))
        setComedyMovies(movies.filter((movie) => movie.genres && movie.genres.includes("Comedy")).slice(0, 20))
        setDramaMovies(movies.filter((movie) => movie.genres && movie.genres.includes("Drama")).slice(0, 20))
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const fetchFeaturedPoster = async (movie: Movie) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      )

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.backdrop_path) {
        setFeaturedPosterUrl(`https://image.tmdb.org/t/p/original${data.backdrop_path}`)
      } else {
        // Try search as fallback if direct ID lookup fails
        const searchResponse = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}`,
        )

        if (!searchResponse.ok) {
          throw new Error(`TMDB search API error: ${searchResponse.status}`)
        }

        const searchData = await searchResponse.json()

        if (searchData.results && searchData.results.length > 0 && searchData.results[0].backdrop_path) {
          setFeaturedPosterUrl(`https://image.tmdb.org/t/p/original${searchData.results[0].backdrop_path}`)
        } else {
          setFeaturedPosterUrl(null)
        }
      }
    } catch (error) {
      console.error("Error fetching featured poster:", error)
      setFeaturedPosterUrl(null)
    }
  }

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
        <div className="absolute inset-0">
          {featuredPosterUrl ? (
            <Image
              src={featuredPosterUrl || "/placeholder.svg"}
              alt={selectedMovie?.title || "Featured movie"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-900" />
          )}
          {/* Darker gradient overlay for better Netflix look */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Content with better padding */}
        <div className="absolute bottom-0 left-0 w-full px-8 md:px-20 pb-24 md:pb-32 z-10">
          {selectedMovie && (
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">{selectedMovie.title}</h1>

              {selectedMovie.tagline && (
                <p className="text-xl md:text-2xl text-gray-300 mb-6 italic">{selectedMovie.tagline}</p>
              )}

              <div className="flex items-center gap-4 mb-4">
                {selectedMovie.vote_average && (
                  <span className="inline-flex items-center justify-center bg-gray-800 text-white font-bold px-3 py-1 rounded">
                    {selectedMovie.vote_average.toFixed(1)}
                  </span>
                )}
                {selectedMovie.release_date && (
                  <span className="text-gray-300">{new Date(selectedMovie.release_date).getFullYear()}</span>
                )}
                {selectedMovie.runtime && <span className="text-gray-300">{selectedMovie.runtime} min</span>}
              </div>

              <p className="mb-8 text-lg text-gray-200 line-clamp-3">{selectedMovie.overview}</p>

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
      <div className="relative z-20 px-8 md:px-20 pb-16 -mt-32">
        <MovieSlider title="Trending Now" movies={trendingMovies} onMovieClick={openMovieDetail} />
        {actionMovies.length > 0 && (
          <MovieSlider title="Action Thrillers" movies={actionMovies} onMovieClick={openMovieDetail} />
        )}
        {comedyMovies.length > 0 && <MovieSlider title="Comedy" movies={comedyMovies} onMovieClick={openMovieDetail} />}
        {dramaMovies.length > 0 && <MovieSlider title="Drama" movies={dramaMovies} onMovieClick={openMovieDetail} />}
      </div>

      {/* Movie Detail Modal */}
      {selectedMovie && <MovieDetail movie={selectedMovie} isOpen={isModalOpen} onClose={closeMovieDetail} />}
    </div>
  )
}
