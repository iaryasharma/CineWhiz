"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [errorDescription, setErrorDescription] = useState<string>("")

  useEffect(() => {
    const errorParam = searchParams.get("error")
    setError(errorParam)

    // Set a more user-friendly error description
    if (errorParam === "AccessDenied") {
      setErrorDescription("There was a problem signing you in. Please try again.")
    } else if (errorParam === "Configuration") {
      setErrorDescription("There is a problem with the server configuration. Please try again later.")
    } else if (errorParam === "Verification") {
      setErrorDescription("The verification link may have expired or been used already. Please try signing in again.")
    } else {
      setErrorDescription("An unexpected error occurred. Please try again.")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-gray-900 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Authentication Error</h1>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <p className="text-gray-300 mb-8">{errorDescription}</p>

          <div className="flex flex-col space-y-4">
            <Link
              href="/auth/signin"
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
            >
              Try Again
            </Link>

            <Link href="/" className="text-gray-300 hover:text-white transition">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}