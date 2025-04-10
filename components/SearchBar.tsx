// components/SearchBar.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

interface SearchBarProps {
  isExpanded?: boolean
  onToggle?: () => void
  onClose?: () => void
  className?: string
}

export default function SearchBar({ isExpanded = false, onToggle, onClose, className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    // Focus search input when expanded
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isExpanded])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      if (onClose) onClose()
    }
  }

  if (!isExpanded) {
    return (
      <button 
        onClick={onToggle}
        className={`text-gray-300 hover:text-white transition-colors ${className}`}
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className={`animate-fadeIn w-full ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search titles, actors, genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md bg-gray-800/90 p-3 pl-4 pr-12 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
          <button 
            type="submit" 
            className="text-gray-400 hover:text-white"
            aria-label="Submit search"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}