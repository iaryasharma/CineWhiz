// components/MovieGrid.tsx
"use client"

import { useState, useEffect } from "react"
import MovieCard from "./MovieCard"
import type { Movie } from "@/types"

interface MovieGridProps {
  title: string
  movies: Movie[]
}

export default function MovieGrid({ title, movies }: MovieGridProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // Prevent SSR issues with window size calculations
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
