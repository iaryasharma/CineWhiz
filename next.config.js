/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "image.tmdb.org",
    ],
    formats: ["image/avif", "image/webp"],
  },
}

module.exports = nextConfig