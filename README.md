# CineWhiz - Movie Recommendation App

CineWhiz is a Netflix-style movie recommendation platform that integrates a FastAPI backend with a Next.js frontend. This repository contains the **frontend only**. For the FastAPI backend, visit: [movie-recommender-fastapi](https://github.com/iaryasharma/movie-recommender-fastapi).

## Features

- Netflix-style UI with movie grid layout
- Movie details modal with poster, overview, and metadata
- Google authentication for user accounts
- Personal watchlist functionality
- Movie recommendations based on selected movies
- Recommendations based on user's watchlist
- Integration with FastAPI recommendation engine

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: [FastAPI Backend Repository](https://github.com/iaryasharma/movie-recommender-fastapi)
- **Database**: MongoDB
- **Authentication**: NextAuth.js with Google provider
- **External APIs**: TMDB API for movie posters

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB instance

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/cinewhiz.git
cd cinewhiz
```

2. **Install frontend dependencies**

```bash
npm install
```

3. **Prepare the movie data**

Make sure you have the TMDB dataset files:
- `tmdb_5000_movies.csv`
- `tmdb_5000_credits.csv`

Run the data preparation script:

```bash
mkdir -p public/data
python scripts/prepare_json.py
```

4. **Set up environment variables**

Create a `.env.local` file in the root directory with the following:

```
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

5. **Start the FastAPI backend**

For the backend setup and running instructions, visit: [movie-recommender-fastapi](https://github.com/iaryasharma/movie-recommender-fastapi)

6. **Start the Next.js frontend**

```bash
npm run dev
```

7. **Visit the application**

Open your browser and navigate to `http://localhost:3000`.

## Project Structure

- `/app`: Next.js app directory
  - `/api`: API routes for authentication and watchlist
  - `/movies`: Movie detail pages
  - `/watchlist`: Watchlist page
- `/components`: React components
- `/lib`: Utility functions and database connection
- `/models`: MongoDB schemas
- `/public`: Static files
  - `/data`: Movie data JSON file
- `/scripts`: Data preparation scripts
- `/types`: TypeScript type definitions

## Deployment

### Frontend (Next.js)

The Next.js application can be deployed to Vercel with minimal configuration:

```bash
npm run build
vercel --prod
```

## License

This project is licensed under the MIT License.

