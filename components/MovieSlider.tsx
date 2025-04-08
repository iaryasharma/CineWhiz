"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid"
import MovieCard from "./MovieCard"
import type { Movie } from "@/types"

interface MovieSliderProps {
  title: string
  movies: Movie[]
  onMovieClick: (movie: Movie) => void
}

export default function MovieSlider({ title, movies, onMovieClick }: MovieSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Check if arrows should be shown
  const checkArrows = () => {
    if (!sliderRef.current) return

    setShowLeftArrow(sliderRef.current.scrollLeft > 20)
    setShowRightArrow(sliderRef.current.scrollLeft < sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 20)
  }

  useEffect(() => {
    const slider = sliderRef.current
    if (slider) {
      slider.addEventListener("scroll", checkArrows)
      // Initial check
      checkArrows()

      return () => {
        slider.removeEventListener("scroll", checkArrows)
      }
    }
  }, [movies])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      checkArrows()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return

    const slider = sliderRef.current
    const scrollAmount = slider.clientWidth * 0.8

    if (direction === "left") {
      slider.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    } else {
      slider.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Mouse drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - sliderRef.current!.offsetLeft)
    setScrollLeft(sliderRef.current!.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const x = e.pageX - sliderRef.current!.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    sliderRef.current!.scrollLeft = scrollLeft - walk
  }

  return (
    <div className="mb-8 relative group">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h2>

      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>
      )}

      {/* Movie Slider */}
      <div
        ref={sliderRef}
        className="flex space-x-2 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 cursor-pointer" onClick={() => onMovieClick(movie)}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>
      )}
    </div>
  )
}
