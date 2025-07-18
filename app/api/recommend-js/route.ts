import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ProcessedMovie {
  id: number
  title: string
  titleLower: string
  tags: string[]
  similarity?: number
}

let processedMovies: ProcessedMovie[] = []
let isInitialized = false

// Simple cosine similarity calculation
function calculateSimilarity(tags1: string[], tags2: string[]): number {
  const set1 = new Set(tags1)
  const set2 = new Set(tags2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  // Jaccard similarity (intersection over union)
  return intersection.size / union.size
}

// Initialize the recommendation system
async function initializeSystem() {
  if (isInitialized) return

  try {
    // Read CSV files
    const moviesPath = path.join(process.cwd(), 'backend', 'tmdb_5000_movies.csv')
    const creditsPath = path.join(process.cwd(), 'backend', 'tmdb_5000_credits.csv')
    
    if (!fs.existsSync(moviesPath) || !fs.existsSync(creditsPath)) {
      throw new Error('CSV files not found')
    }

    // For now, we'll use a simpler approach with the movies.json file
    const moviesJsonPath = path.join(process.cwd(), 'public', 'data', 'movies.json')
    
    if (fs.existsSync(moviesJsonPath)) {
      const moviesData = JSON.parse(fs.readFileSync(moviesJsonPath, 'utf-8'))
      
      processedMovies = moviesData.map((movie: Record<string, unknown>) => ({
        id: movie.id as number,
        title: movie.title as string,
        titleLower: (movie.title as string).toLowerCase(),
        tags: [
          ...((movie.overview as string)?.split(' ') || []),
          ...((movie.genres as string[]) || []),
          ...((movie.cast as string[]) || []),
          ...((movie.director as string[]) || []),
          ...((movie.keywords as string[]) || [])
        ].map(tag => tag.toLowerCase()).filter(Boolean)
      }))
      
      isInitialized = true
      console.log(`Initialized recommendation system with ${processedMovies.length} movies`)
    } else {
      throw new Error('Movies data not found')
    }
  } catch (error) {
    console.error('Failed to initialize recommendation system:', error)
    throw error
  }
}

// Get recommendations for a movie
function getRecommendations(movieTitle: string, topN: number = 5): string[] {
  const targetMovie = processedMovies.find(
    movie => movie.titleLower === movieTitle.toLowerCase()
  )
  
  if (!targetMovie) {
    return []
  }
  
  // Calculate similarity with all other movies
  const similarities = processedMovies
    .filter(movie => movie.id !== targetMovie.id)
    .map(movie => ({
      ...movie,
      similarity: calculateSimilarity(targetMovie.tags, movie.tags)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN)
  
  return similarities.map(movie => movie.title)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')

    if (!title) {
      return NextResponse.json(
        { error: 'Movie title is required' },
        { status: 400 }
      )
    }

    // Initialize the system if not already done
    await initializeSystem()

    // Get recommendations
    const recommendations = getRecommendations(title, 5)
    
    if (recommendations.length === 0) {
      return NextResponse.json(
        { error: `Movie '${title}' not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { recommended: recommendations },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error in recommendation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
