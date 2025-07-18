# Vercel Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. TMDB API 404 Errors
**Problem**: Movies not found in TMDB API
**Solution**: 
- Ensure `NEXT_PUBLIC_TMDB_API_KEY` is set in Vercel environment variables
- Also add `TMDB_API_KEY` as a fallback environment variable
- Check that the API key is valid and active

### 2. Recommendation API 500 Errors
**Problem**: Movie recommendations failing
**Solution**:
- Ensure `public/data/movies.json` file is included in the deployment
- Check that the movies.json file is not too large (Vercel has size limits)
- Verify file system access is working in the serverless environment

### 3. Environment Variables
**Required Variables for Vercel**:
```
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
TMDB_API_KEY=your_tmdb_api_key
```

### 4. File Size Limits
**Problem**: Large movies.json file causing deployment issues
**Solution**: 
- Consider splitting the movies.json file into smaller chunks
- Use a CDN or external storage for large data files
- Implement lazy loading for movie data

### 5. Serverless Function Timeouts
**Problem**: Functions timing out on Vercel
**Solution**: 
- Increase function timeout in vercel.json
- Optimize recommendation algorithm
- Consider using edge functions for better performance

### 6. Static File Access
**Problem**: Cannot access public files from API routes
**Solution**:
- Use file system access instead of HTTP requests
- Ensure files are in the correct public directory structure
- Check that files are included in the deployment

## Deployment Steps

1. **Set Environment Variables**:
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all required environment variables

2. **Check Build Configuration**:
   - Ensure `next.config.js` is properly configured
   - Verify `vercel.json` settings are correct

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Monitor Logs**:
   - Check Vercel function logs for errors
   - Use `console.log` statements for debugging
   - Monitor browser console for client-side errors

## Testing Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```

4. **Test API endpoints**:
   - `/api/tmdb/[id]` - Movie details
   - `/api/recommend?title=MovieName` - Recommendations
   - `/api/watchlist` - Watchlist operations
