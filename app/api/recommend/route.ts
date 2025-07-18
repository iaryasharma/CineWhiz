import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
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
    const moviesJsonPath = path.join(process.cwd(), 'public', 'data', 'movies.json')
    
    if (fs.existsSync(moviesJsonPath)) {
      const moviesData = JSON.parse(fs.readFileSync(moviesJsonPath, 'utf-8'))
      
      processedMovies = moviesData.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        titleLower: movie.title.toLowerCase(),
        tags: [
          ...(movie.overview ? movie.overview.split(' ') : []),
          ...(movie.genres || []),
          ...(movie.cast || []),
          ...(movie.director || []),
          ...(movie.keywords || [])
        ].map(tag => tag.toLowerCase()).filter(Boolean)
      }))
      
      isJsFallbackInitialized = true
      console.log(`Initialized JS fallback with ${processedMovies.length} movies`)
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

    // Try Python-based recommendation first
    try {
      const pythonScript = path.join(process.cwd(), 'api', 'recommend.py')
      
      if (fs.existsSync(pythonScript)) {
        const pythonExecutable = process.platform === 'win32' ? 'C:/Users/as706/AppData/Local/Programs/Python/Python38/python.exe' : 'python3'
        
        const result = await new Promise<any>((resolve, reject) => {
          const pythonProcess = spawn(pythonExecutable, [pythonScript, title])
          
          let stdout = ''
          let stderr = ''
          
          pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString()
          })
          
          pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString()
          })
          
          pythonProcess.on('close', (code) => {
            if (code === 0) {
              try {
                const parsed = JSON.parse(stdout)
                resolve(parsed)
              } catch (e) {
                reject(new Error('Failed to parse Python output'))
              }
            } else {
              reject(new Error(`Python process exited with code ${code}: ${stderr}`))
            }
          })
          
          pythonProcess.on('error', (error) => {
            reject(error)
          })
        })

        if (result && !('error' in result)) {
          return NextResponse.json(result, { status: 200 })
        }
      }
    } catch (pythonError: any) {
      console.log('Python recommendation failed, falling back to JS:', pythonError?.message || 'Unknown error')
    }

    // Fallback to JavaScript implementation
    await initializeJsFallback()
    const recommendations = getJsRecommendations(title, 5)
    
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
