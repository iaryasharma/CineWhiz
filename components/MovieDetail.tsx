"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Movie, CastMember, CrewMember, Genre, ProductionCompany } from "@/types"
import { formatDate } from "@/lib/utils"
import WatchlistButton from "./WatchlistButton"
import RecommendationRow from "./RecommendationRow"
import Modal from "react-modal"
import { XMarkIcon, StarIcon, PlayIcon } from "@heroicons/react/24/solid"

interface MovieDetailProps {
  movie: Movie
  isOpen: boolean
  onClose: () => void
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
  const [movieDetails, setMovieDetails] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize modal app element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        Modal.setAppElement(document.body);
      } catch (error) {
        console.warn('Could not set Modal app element:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        // Fetch full movie details including cast, crew, etc.
        const response = await fetch(`/api/tmdb/${movie.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Movie with ID ${movie.id} not found in TMDB`);
            // Don't set error, just use the basic movie data
            setMovieDetails(null);
            return;
          }
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setMovieDetails(data)
        
      } catch (error) {
        console.error("Error fetching movie details:", error)
        // Don't set movieDetails to null on error, just log it
        setMovieDetails(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieDetails()
  }, [movie.id, isOpen])

  const handleTrailerClick = () => {
    // Check for trailer in movieDetails first
    if (movieDetails?.videos?.results && movieDetails.videos.results.length > 0) {
      const trailer = movieDetails.videos.results.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) || movieDetails.videos.results[0]; // fallback to first video
      
      if (trailer && trailer.site === 'YouTube') {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const displayMovie = movieDetails || movie
  const backdropUrl = displayMovie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${displayMovie.backdrop_path}`
    : null
  const hasTrailer = movieDetails?.videos?.results && movieDetails.videos.results.length > 0

  // Debug logging for production issues
  console.log('MovieDetail Debug:', {
    movieId: movie.id,
    movieDetailsExists: !!movieDetails,
    hasCredits: !!movieDetails?.credits,
    hasGenres: !!displayMovie?.genres,
    hasTrailer,
    isLoading
  })

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onClose} 
      style={customStyles} 
      contentLabel={`Details for ${movie.title}`}
      closeTimeoutMS={300}
      ariaHideApp={false}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{displayMovie.title}</h2>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <button 
                className={`flex items-center justify-center gap-2 bg-white text-black px-6 py-2 rounded hover:bg-opacity-80 transition ${!hasTrailer ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleTrailerClick}
                disabled={!hasTrailer}
              >
                <PlayIcon className="h-5 w-5" />
                Trailer
              </button>
              
              <WatchlistButton movieId={displayMovie.id} />

              {displayMovie.vote_average !== undefined && (
                <div className="flex items-center bg-gray-800 bg-opacity-60 px-3 py-2 rounded-md border border-gray-700">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="text-white font-medium">{displayMovie.vote_average.toFixed(1)}/10</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-12 pt-0">
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-4 mb-4">
                {displayMovie.vote_average !== undefined && (
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="text-white font-medium">{displayMovie.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                <span className="text-gray-400">{displayMovie.release_date && formatDate(displayMovie.release_date)}</span>
                
                {displayMovie.runtime && (
                  <span className="text-gray-400">{Math.floor(displayMovie.runtime / 60)}h {displayMovie.runtime % 60}m</span>
                )}
              </div>
              
              <p className="text-lg mb-6">{displayMovie.overview}</p>
            </div>
            
            <div className="w-full md:w-1/3 text-sm">
              {/* Show cast if available */}
              {movieDetails?.credits?.cast && movieDetails.credits.cast.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400">Cast: </span>
                  <span>{movieDetails.credits.cast.slice(0, 5).map((person: CastMember) => person.name).join(", ")}</span>
                </div>
              )}
              
              {/* Show director if available */}
              {movieDetails?.credits?.crew && movieDetails.credits.crew.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400">Director: </span>
                  <span>{movieDetails.credits.crew.map((person: CrewMember) => person.name).join(", ")}</span>
                </div>
              )}
              
              {/* Show genres - prefer movieDetails genres but fallback to movie genres */}
              {((movieDetails?.genres && movieDetails.genres.length > 0) || 
                (displayMovie.genres && displayMovie.genres.length > 0)) && (
                <div className="mb-4">
                  <span className="text-gray-400">Genres: </span>
                  <span>
                    {(movieDetails?.genres || displayMovie.genres || []).map((genre: string | Genre) => 
                      typeof genre === 'string' ? genre : genre.name
                    ).join(", ")}
                  </span>
                </div>
              )}
              
              {/* Show runtime if available */}
              {(movieDetails?.runtime || displayMovie.runtime) && (
                <div className="mb-4">
                  <span className="text-gray-400">Runtime: </span>
                  <span>
                    {(() => {
                      const runtime = movieDetails?.runtime || displayMovie.runtime || 0;
                      return `${Math.floor(runtime / 60)}h ${runtime % 60}m`;
                    })()}
                  </span>
                </div>
              )}
              
              {/* Show original language */}
              {displayMovie.original_language && (
                <div className="mb-4">
                  <span className="text-gray-400">Language: </span>
                  <span>{displayMovie.original_language.toUpperCase()}</span>
                </div>
              )}
              
              {/* Show production companies if available */}
              {movieDetails?.production_companies && movieDetails.production_companies.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400">Production: </span>
                  <span>{movieDetails.production_companies.slice(0, 2).map((company: ProductionCompany) => company.name).join(", ")}</span>
                </div>
              )}
            </div>  
          </div>
          
          {/* Recommendations Section */}
          {displayMovie.id && displayMovie.title && (
            <RecommendationRow movieId={displayMovie.id} movieTitle={displayMovie.title} onMovieClick={onClose} />
          )}
        </div>
      </div>
    </Modal>
  )
}