import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Fallback JavaScript recommendation system
interface ProcessedMovie {
  id: number
  title: string
  titleLower: string
  tags: string[]
}

let processedMovies: ProcessedMovie[] = []
let isJsFallbackInitialized = false

function calculateSimilarity(tags1: string[], tags2: string[]): number {
  const set1 = new Set(tags1)
  const set2 = new Set(tags2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

async function initializeJsFallback() {
  if (isJsFallbackInitialized) return

  try {
    // Try to load from public folder first (for Vercel)
    let moviesData;
    try {
      // Use relative path for Vercel deployment
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
      const publicResponse = await fetch(`${baseUrl}/data/movies.json`);
      if (publicResponse.ok) {
        moviesData = await publicResponse.json();
      } else {
        throw new Error('Public fetch failed');
      }
    } catch {
      // Fallback to file system read (for local development)
      const moviesJsonPath = path.join(process.cwd(), 'public', 'data', 'movies.json')
      
      if (fs.existsSync(moviesJsonPath)) {
        moviesData = JSON.parse(fs.readFileSync(moviesJsonPath, 'utf-8'))
      } else {
        throw new Error('Movies data not found');
      }
    }
    
    if (moviesData) {
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
      
      isJsFallbackInitialized = true
      console.log(`Initialized JS fallback with ${processedMovies.length} movies`)
    } else {
      console.log('Movies data not found or empty')
    }
  } catch (error) {
    console.error('Failed to initialize JS fallback:', error)
  }
}

function getJsRecommendations(movieTitle: string, topN: number = 5): string[] {
  const targetMovie = processedMovies.find(
    movie => movie.titleLower === movieTitle.toLowerCase()
  )
  
  if (!targetMovie) {
    return []
  }
  
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

    // Use JavaScript implementation for recommendations
    await initializeJsFallback()
    
    // Check if movies data was loaded
    if (processedMovies.length === 0) {
      return NextResponse.json(
        { error: `Can't show recommendations for "${title}" as I'm currently trained on 5000 movies only and the movie database is not available` },
        { status: 404 }
      )
    }
    
    const recommendations = getJsRecommendations(title, 5)
    
    if (recommendations.length === 0) {
      return NextResponse.json(
        { error: `Can't show recommendations for "${title}" as I'm currently trained on 5000 movies only and this movie is not in my database` },
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
