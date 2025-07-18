import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if movies.json is accessible
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/data/movies.json`)
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Movies data not accessible',
          status: response.status,
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      moviesCount: data.length,
      sampleMovie: data[0]?.title || 'No movies found',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to verify movies data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
