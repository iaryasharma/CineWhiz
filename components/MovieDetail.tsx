"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Movie } from "@/types"
import { formatDate } from "@/lib/utils"
import WatchlistButton from "./WatchlistButton"
import RecommendationRow from "./RecommendationRow"
import Modal from "react-modal"
import { XMarkIcon, StarIcon, PlayIcon } from "@heroicons/react/24/solid"

// Set app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

interface MovieDetailProps {
  movie: Movie
  isOpen: boolean
  onClose: () => void
}

interface VideoResult {
  type: string;
  site: string;
  key: string;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#181818",
    borderRadius: "8px",
    padding: "0",
    border: "none",
    width: "90%",
    maxWidth: "900px",
    maxHeight: "90vh",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
}

export default function MovieDetail({ movie, isOpen, onClose }: MovieDetailProps) {
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null)
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMovieMedia = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        if (!apiKey) {
          console.error("TMDB API key is not defined");
          setIsLoading(false);
          return;
        }
        
        // First try to get by ID
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`,
        )

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.backdrop_path) {
          setBackdropUrl(`https://image.tmdb.org/t/p/original${data.backdrop_path}`)
        }
        
        // Fetch movie trailer
        const videosResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}`
        )
        
        if (videosResponse.ok) {
          const videosData = await videosResponse.json()
          const trailer = videosData.results?.find(
            (video: VideoResult) => 
              (video.type === 'Trailer' || video.type === 'Teaser') && 
              video.site === 'YouTube'
          )
          
          if (trailer) {
            setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`)
          }
        }
        
        // If no data found by ID, try search
        if (!data.backdrop_path) {
          const searchResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movie.title)}`,
          )

          if (!searchResponse.ok) {
            throw new Error(`TMDB search API error: ${searchResponse.status}`)
          }

          const searchData = await searchResponse.json()

          if (searchData.results && searchData.results.length > 0) {
            const foundMovie = searchData.results[0]
            
            if (foundMovie.backdrop_path) {
              setBackdropUrl(`https://image.tmdb.org/t/p/original${foundMovie.backdrop_path}`)
            }
            
            // Try to get trailer for the found movie
            if (!trailerUrl && foundMovie.id) {
              const foundVideosResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${foundMovie.id}/videos?api_key=${apiKey}`
              )
              
              if (foundVideosResponse.ok) {
                const foundVideosData = await foundVideosResponse.json()
                const foundTrailer = foundVideosData.results?.find(
                  (video: VideoResult) => 
                    (video.type === 'Trailer' || video.type === 'Teaser') && 
                    video.site === 'YouTube'
                )
                
                if (foundTrailer) {
                  setTrailerUrl(`https://www.youtube.com/watch?v=${foundTrailer.key}`)
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching movie media:", error)
        setBackdropUrl(null)
        setTrailerUrl(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieMedia()
  }, [movie.id, movie.title, isOpen, trailerUrl])

  const handleTrailerClick = () => {
    if (trailerUrl) {
      window.open(trailerUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onClose} 
      style={customStyles} 
      contentLabel={`Details for ${movie.title}`}
      closeTimeoutMS={300}
    >
      <div className="text-white overflow-y-auto max-h-full">
        <button 
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/40 rounded-full p-1"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Hero Section with Backdrop */}
        <div className="relative h-96 w-full">
          {isLoading ? (
            <div className="bg-gray-800 h-full w-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : backdropUrl ? (
            <>
              <Image
                src={backdropUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                className="object-cover"
                priority
              />
              {/* Only fade from bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#181818] to-transparent" />
            </>
          ) : (
            <div className="bg-gray-800 h-full w-full flex items-center justify-center">
              <h2 className="text-2xl font-bold">{movie.title}</h2>
            </div>
          )}
          
          {/* Content overlay on backdrop */}
          <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{movie.title}</h2>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <button 
                className={`flex items-center justify-center gap-2 bg-white text-black px-6 py-2 rounded hover:bg-opacity-80 transition ${!trailerUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleTrailerClick}
                disabled={!trailerUrl}
              >
                <PlayIcon className="h-5 w-5" />
                Trailer
              </button>
              
              <WatchlistButton movieId={movie.id} />

              {movie.vote_average !== undefined && (
                <div className="flex items-center bg-gray-800 bg-opacity-60 px-3 py-2 rounded-md border border-gray-700">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="text-white font-medium">{movie.vote_average.toFixed(1)}/10</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-12 pt-0">
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-4 mb-4">
                {movie.vote_average !== undefined && (
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="text-white font-medium">{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                <span className="text-gray-400">{movie.release_date && formatDate(movie.release_date)}</span>
                
                {movie.runtime && (
                  <span className="text-gray-400">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                )}
              </div>
              
              <p className="text-lg mb-6">{movie.overview}</p>
            </div>
            
            <div className="w-full md:w-1/3 text-sm">
              {movie.cast && movie.cast.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400">Cast: </span>
                  <span>{movie.cast.slice(0, 5).join(", ")}{movie.cast.length > 5 ? ", more..." : ""}</span>
                </div>
              )}
              
              {movie.crew && movie.crew.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400">Director: </span>
                  <span>{movie.crew.join(", ")}</span>
                </div>
              )}
              
              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400">Genres: </span>
                  <span>{movie.genres.join(", ")}</span>
                </div>
              )}
              
              {movie.original_language && (
                <div>
                  <span className="text-gray-400">Language: </span>
                  <span>{movie.original_language.toUpperCase()}</span>
                </div>
              )}
            </div>  
          </div>
          
          {/* Recommendations Section */}
          {movie.id && movie.title && (
            <RecommendationRow movieId={movie.id} movieTitle={movie.title} onMovieClick={onClose} />
          )}
        </div>
      </div>
    </Modal>
  )
}