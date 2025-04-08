/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // For Google profile images
      "image.tmdb.org", // For TMDB movie posters
    ],
    formats: ["image/avif", "image/webp"],
  },
}

module.exports = nextConfig
