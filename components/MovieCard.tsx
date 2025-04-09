// components/MovieCard.tsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PlayIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/24/solid"
import { StarIcon } from "@heroicons/react/24/solid"
import type { Movie } from "@/types"

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        // First try to get by ID
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        )

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.poster_path) {
          setPosterUrl(`https://image.tmdb.org/t/p/w500${data.poster_path}`)
        } else {
          // If no poster by ID, try search by title
          const searchResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}`,
          )

          if (!searchResponse.ok) {
            throw new Error(`TMDB search API error: ${searchResponse.status}`)
          }

          const searchData = await searchResponse.json()

          if (searchData.results && searchData.results.length > 0 && searchData.results[0].poster_path) {
            setPosterUrl(`https://image.tmdb.org/t/p/w500${searchData.results[0].poster_path}`)
          } else {
            setPosterUrl(null)
          }
        }
      } catch (error) {
        console.error("Error fetching poster:", error)
        setPosterUrl(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPoster()
  }, [movie.id, movie.title])

  return (
    <div 
      className="relative h-48 w-32 md:h-64 md:w-44 rounded transition-all duration-200 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        transform: isHovering ? 'scale(1.1) translateZ(0)' : 'scale(1) translateZ(0)',
        zIndex: isHovering ? 10 : 0,
      }}
    >
      {/* Poster Image */}
      {isLoading ? (
        <div className="bg-gray-800 animate-pulse h-full w-full" />
      ) : posterUrl ? (
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-200 ${isHovering ? 'brightness-50' : ''}`}
          priority={false}
        />
      ) : (
        <div className="bg-gray-800 h-full w-full flex items-center justify-center p-2">
          <p className="text-center text-white text-xs">{movie.title}</p>
        </div>
      )}

      {/* Hover Card with Info - Only Show On Hover */}
      {isHovering && (
        <div className="absolute inset-0 flex flex-col justify-between p-2 z-10">
          <div>
            <h3 className="font-bold text-white text-sm mb-1">{movie.title}</h3>
            
            {movie.release_date && (
              <p className="text-xs text-gray-300 mb-1">{new Date(movie.release_date).getFullYear()}</p>
            )}
            
            {movie.vote_average !== undefined && (
              <div className="flex items-center text-xs mb-1">
                <StarIcon className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-white font-medium">
                  {movie.vote_average.toFixed(1)}/10
                </span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              <button className="bg-white rounded-full p-1 hover:bg-gray-300" title="Play">
                <PlayIcon className="h-3 w-3 text-black" />
              </button>
              <button className="border border-gray-300 rounded-full p-1 hover:border-white" title="Add to My List">
                <PlusIcon className="h-3 w-3 text-white" />
              </button>
            </div>
            <button className="border border-gray-300 rounded-full p-1 hover:border-white" title="More Info">
              <ChevronDownIcon className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Always visible title gradient at bottom (only shows when not hovering) */}
      {!isHovering && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-6 pb-2 px-2">
          <p className="text-white text-xs font-medium truncate">{movie.title}</p>
        </div>
      )}
    </div>
  )
}