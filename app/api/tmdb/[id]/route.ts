import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const movieId = id

    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'TMDB API key not configured' },
        { status: 500 }
      )
    }

    // Fetch movie details
    const movieResponse = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`
    )

    if (!movieResponse.ok) {
      throw new Error(`TMDB API error: ${movieResponse.status}`)
    }

    const movieData = await movieResponse.json()
    
    // Transform the data
    const transformedMovie = {
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      poster_path: movieData.poster_path,
      backdrop_path: movieData.backdrop_path,
      release_date: movieData.release_date,
      vote_average: movieData.vote_average,
      vote_count: movieData.vote_count,
      genres: movieData.genres,
      runtime: movieData.runtime,
      budget: movieData.budget,
      revenue: movieData.revenue,
      production_companies: movieData.production_companies,
      production_countries: movieData.production_countries,
      spoken_languages: movieData.spoken_languages,
      status: movieData.status,
      tagline: movieData.tagline,
      original_language: movieData.original_language,
      original_title: movieData.original_title,
      popularity: movieData.popularity,
      adult: movieData.adult,
      video: movieData.video,
      credits: {
        cast: movieData.credits?.cast?.slice(0, 10) || [],
        crew: movieData.credits?.crew?.filter((person: any) => person.job === 'Director') || []
      },
      videos: {
        results: movieData.videos?.results?.slice(0, 3) || []
      },
      similar: {
        results: movieData.similar?.results?.slice(0, 12) || []
      }
    }

    return NextResponse.json(transformedMovie)
    
  } catch (error) {
    console.error('Error in movie details API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    )
  }
}
