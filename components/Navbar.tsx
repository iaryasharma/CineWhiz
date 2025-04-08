"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, BookmarkIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Detect scroll position for navbar background
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      if (scrollPosition > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Focus search input when search is opened
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSignIn = () => {
    router.push("/auth/signin")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsSearchOpen(false)
    }
  }

  const goToWatchlist = () => {
    router.push("/watchlist")
  }

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? "bg-black shadow-lg" : "bg-gradient-to-b from-black/90 to-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link href="/" className="text-red-600 font-bold text-3xl md:text-4xl flex items-center">
              CineWhiz
            </Link>
            
            {/* Desktop navigation links */}
            <div className="hidden md:flex ml-8 space-x-6">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/movies" className="text-gray-300 hover:text-white transition-colors">
                Movies
              </Link>
              {session && (
                <button 
                  onClick={goToWatchlist} 
                  className="text-gray-300 hover:text-white flex items-center transition-colors"
                >
                  <BookmarkIcon className="h-5 w-5 mr-1.5" />
                  My List
                </button>
              )}
            </div>
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            
            {status === "loading" ? (
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image || "/placeholder.svg"}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                      {session.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-gray-300 pr-1">{session.user?.name?.split(' ')[0]}</span>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-black/95 border border-gray-700 rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link href="/account" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">
                    Account
                  </Link>
                  <button 
                    onClick={() => signOut({ callbackUrl: "/" })} 
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleSignIn} 
                className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition font-medium"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-300 hover:text-white"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            
            {status === "authenticated" && (
              <button onClick={goToWatchlist} className="text-gray-300">
                <BookmarkIcon className="h-6 w-6" />
              </button>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-gray-300 hover:text-white"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search bar - shows when search is open */}
        {isSearchOpen && (
          <div className="py-3 animate-fadeIn">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search titles, actors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md bg-gray-800/90 p-3 pl-4 pr-12 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label="Submit search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gray-800 animate-fadeIn">
            <div className="flex flex-col space-y-1 py-3">
              <Link 
                href="/" 
                className="text-gray-300 hover:bg-gray-800 hover:text-white px-4 py-3"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/movies" 
                className="text-gray-300 hover:bg-gray-800 hover:text-white px-4 py-3"
                onClick={() => setIsMenuOpen(false)}
              >
                Movies
              </Link>

              {status === "loading" ? (
                <div className="px-4 py-3">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : session ? (
                <div className="border-t border-gray-800 mt-2 pt-2">
                  <div className="flex items-center px-4 py-3">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image || "/placeholder.svg"}
                        alt={session.user.name || "User"}
                        width={28}
                        height={28}
                        className="rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white mr-3">
                        {session.user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="text-gray-300 font-medium">{session.user?.name}</span>
                  </div>
                  
                  <Link 
                    href="/account" 
                    className="text-gray-300 hover:bg-gray-800 hover:text-white px-4 py-3 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-300 hover:bg-gray-800 hover:text-white w-full text-left px-4 py-3"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <button
                    onClick={() => {
                      router.push("/auth/signin");
                      setIsMenuOpen(false);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-md w-full hover:bg-red-700 transition"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
