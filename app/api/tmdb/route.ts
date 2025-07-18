import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const category = searchParams.get('category') || 'popular'
    const query = searchParams.get('query')
    const timeWindow = searchParams.get('time_window') || 'day'
    const region = searchParams.get('region')
    const withGenres = searchParams.get('with_genres')
    const withOriginCountry = searchParams.get('with_origin_country')
    const sortBy = searchParams.get('sort_by')

    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'TMDB API key not configured' },
        { status: 500 }
      )
    }

    let url = ''
    
    if (query) {
      // Search movies
      url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    } else {
      // Get movies by category
      switch (category) {
        case 'popular':
          url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
          break
        case 'top_rated':
          url = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
          break
        case 'upcoming':
          url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`
          break
        case 'now_playing':
          url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`
          break
        case 'trending':
          url = `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}&page=${page}`
          if (region) {
            url += `&region=${region}`
          }
          break
        case 'discover':
          url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&page=${page}`
          if (withGenres) {
            url += `&with_genres=${withGenres}`
          }
          if (region) {
            url += `&region=${region}`
          }
          if (withOriginCountry) {
            url += `&with_origin_country=${withOriginCountry}`
          }
          if (sortBy) {
            url += `&sort_by=${sortBy}`
          }
          break
        default:
          url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
      }
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform the data to match our movie interface
    const transformedResults = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: movie.genre_ids,
      popularity: movie.popularity,
      original_language: movie.original_language,
      original_title: movie.original_title,
      adult: movie.adult,
      video: movie.video
    }))

    return NextResponse.json({
      results: transformedResults,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    })
    
  } catch (error) {
    console.error('Error in TMDB API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    )
  }
}
