"use client"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState("")
  const [backgroundMoviePool, setBackgroundMoviePool] = useState<any[]>([])
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0)
  
  useEffect(() => {
    // Fetch random backdrop from TMDB
    const fetchRandomBackdrops = async () => {
      try {
        // Fetch popular movies to create a pool of backgrounds
        const response = await fetch(`/api/tmdb?category=popular&page=1`)
        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          // Filter movies that have backdrop images
          const moviesWithBackdrops = data.results.filter((movie: any) => movie.backdrop_path)
          setBackgroundMoviePool(moviesWithBackdrops)
          
          // Select a random movie from the pool on page load
          const randomIndex = Math.floor(Math.random() * moviesWithBackdrops.length)
          setCurrentBackgroundIndex(randomIndex)
          
          const randomMovie = moviesWithBackdrops[randomIndex]
          if (randomMovie.backdrop_path) {
            setBackgroundImage(`https://image.tmdb.org/t/p/original${randomMovie.backdrop_path}`)
          }
        }
      } catch (error) {
        console.error("Error fetching backdrop:", error)
        // If there's an error, don't set a background image
      }
    }
    
    fetchRandomBackdrops()
  }, [])

  // Rotate background every 2 minutes
  useEffect(() => {
    if (backgroundMoviePool.length === 0) return

    const rotateBackground = () => {
      const nextIndex = (currentBackgroundIndex + 1) % backgroundMoviePool.length
      setCurrentBackgroundIndex(nextIndex)
      
      const nextMovie = backgroundMoviePool[nextIndex]
      if (nextMovie.backdrop_path) {
        setBackgroundImage(`https://image.tmdb.org/t/p/original${nextMovie.backdrop_path}`)
      }
    }

    const interval = setInterval(rotateBackground, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [backgroundMoviePool, currentBackgroundIndex])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className={`min-h-screen transition-all duration-1000 ease-in-out ${backgroundImage ? "bg-cover bg-center bg-no-repeat" : "bg-black"}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
      } : {}}
    >
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-md bg-black/75 p-8 text-white">
          <div>
            <h2 className="mt-2 text-center text-3xl font-bold">Sign In to CineWhiz</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Continue with your Google account
            </p>
          </div>
          
          <div className="space-y-4">            
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-md bg-white py-3 text-black hover:bg-gray-200 transition"
            >
              {isLoading ? (
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Sign in with Google
            </button>
            
            <div className="pt-4 text-gray-400">
              <p className="text-center text-sm">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
              <p className="mt-2 text-center text-xs">
                This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}