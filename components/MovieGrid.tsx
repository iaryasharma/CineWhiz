// components/MovieGrid.tsx
"use client"

import { useState, useEffect } from "react"
import MovieCard from "./MovieCard"
import type { Movie } from "@/types"

interface MovieGridProps {
  title: string
  movies: Movie[]
  onMovieClick?: (movie: Movie) => void
}

export default function MovieGrid({ title, movies, onMovieClick }: MovieGridProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {movies.length === 0 ? (
        <p className="text-gray-400">No movies found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <div 
              key={movie.id}
              onClick={() => onMovieClick?.(movie)}
              className="cursor-pointer"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}