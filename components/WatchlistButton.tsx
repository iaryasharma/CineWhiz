"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { PlusIcon, CheckIcon } from "@heroicons/react/24/solid"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useRouter } from "next/navigation"

interface WatchlistButtonProps {
  movieId: number
}

interface WatchlistItem {
  movieId: number
  // Add other properties as needed based on your actual data structure
  addedAt?: string
  userId?: string
}

export default function WatchlistButton({ movieId }: WatchlistButtonProps) {
  const { data: session } = useSession()
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if movie is in watchlist
    const checkWatchlist = async () => {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/watchlist")
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        const watchlist = data.watchlist || []
        setIsInWatchlist(watchlist.some((item: WatchlistItem) => item.movieId === movieId))
      } catch (error) {
        console.error("Error checking watchlist:", error)
        toast.error("Failed to load watchlist status")
      } finally {
        setIsLoading(false)
      }
    }

    checkWatchlist()
  }, [session, movieId])

  const handleWatchlistToggle = async () => {
    if (!session) {
      // Redirect to sign in page
      router.push("/auth/signin");
      return;
    }

    try {
      setIsLoading(true)

      if (isInWatchlist) {
        // Remove from watchlist
        const response = await fetch(`/api/watchlist?movieId=${movieId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        toast.success("Removed from My List")
        setIsInWatchlist(false)
      } else {
        // Add to watchlist
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieId }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        toast.success("Added to My List")
        setIsInWatchlist(true)
      }
    } catch (error) {
      console.error("Error updating watchlist:", error)
      toast.error("Failed to update My List")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleWatchlistToggle}
        disabled={isLoading}
        className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium transition ${
          isInWatchlist 
            ? "bg-gray-800 hover:bg-gray-700 border border-white text-white" 
            : "bg-white hover:bg-gray-200 text-black"
        }`}
        aria-label={isInWatchlist ? "Remove from My List" : "Add to My List"}
      >
        {isLoading ? (
          <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isInWatchlist ? (
          <CheckIcon className="h-5 w-5" />
        ) : (
          <PlusIcon className="h-5 w-5" />
        )}
        {isInWatchlist ? "In My List" : "Add to My List"}
      </button>
      <ToastContainer 
        position="bottom-center" 
        theme="dark" 
        autoClose={2000}
        hideProgressBar
        closeButton={false}
        toastClassName="bg-gray-900 text-white"
      />
    </>
  )
}