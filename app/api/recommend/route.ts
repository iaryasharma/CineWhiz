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
    // Try to load movies data
    let moviesData;
    try {
      // For Vercel, read from file system directly
      const moviesJsonPath = path.join(process.cwd(), 'public', 'data', 'movies.json')
      
      if (fs.existsSync(moviesJsonPath)) {
        moviesData = JSON.parse(fs.readFileSync(moviesJsonPath, 'utf-8'))
        console.log('Successfully read movies data from file system');
      } else {
        console.log('Movies file not found at:', moviesJsonPath);
        throw new Error('Movies data not found');
      }
    } catch (fsError) {
      console.log('File system read error:', fsError);
      throw new Error('Movies data not found');
    }
    
    if (moviesData) {
      processedMovies = moviesData.map((movie: Record<string, unknown>) => {
        // Ensure all required fields exist
        const title = movie.title as string;
        const overview = movie.overview as string;
        const genres = movie.genres as string[] || [];
        const cast = movie.cast as string[] || [];
        const crew = movie.crew as string[] || [];
        const keywords = movie.keywords as string[] || [];
        
        if (!title) {
          console.warn('Movie without title found:', movie);
          return null;
        }
        
        return {
          id: movie.id as number,
          title,
          titleLower: title.toLowerCase(),
          tags: [
            ...(overview?.split(' ') || []),
            ...genres,
            ...cast,
            ...crew,
            ...keywords
          ].map(tag => tag.toLowerCase()).filter(Boolean)
        };
      }).filter(Boolean) as ProcessedMovie[];
      
      isJsFallbackInitialized = true
      console.log(`Initialized JS fallback with ${processedMovies.length} movies`)
    } else {
      console.log('Movies data not found or empty')
    }
  } catch (error) {
    console.error('Failed to initialize JS fallback:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      cwd: process.cwd(),
      publicDataPath: path.join(process.cwd(), 'public', 'data'),
      fileExists: fs.existsSync(path.join(process.cwd(), 'public', 'data', 'movies.json'))
    });
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

    console.log('Recommendation requested for:', title);
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_URL: process.env.VERCEL_URL,
      hasMoviesFile: fs.existsSync(path.join(process.cwd(), 'public', 'data', 'movies.json'))
    });

    // Use JavaScript implementation for recommendations
    try {
      await initializeJsFallback()
    } catch (error) {
      console.error('Failed to initialize JS fallback:', error);
      return NextResponse.json(
        { error: `Can't show recommendations for "${title}" as I'm currently trained on 5000 movies only and the movie database is not available` },
        { status: 500 }
      )
    }
    
    // Check if movies data was loaded
    if (processedMovies.length === 0) {
      console.log('No processed movies available');
      return NextResponse.json(
        { error: `Can't show recommendations for "${title}" as I'm currently trained on 5000 movies only and the movie database is not available` },
        { status: 404 }
      )
    }
    
    const recommendations = getJsRecommendations(title, 5)
    
    if (recommendations.length === 0) {
      console.log('No recommendations found for:', title);
      return NextResponse.json(
        { error: `Can't show recommendations for "${title}" as I'm currently trained on 5000 movies only and this movie is not in my database` },
        { status: 404 }
      )
    }

    console.log('Recommendations found:', recommendations);
    return NextResponse.json(
      { recommended: recommendations },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error in recommendation API:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations. Please try again later.' },
      { status: 500 }
    )
  }
}
