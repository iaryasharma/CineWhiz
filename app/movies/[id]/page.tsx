'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Movie } from '@/types';
import MovieDetail from '@/components/MovieDetail';

interface MoviePageProps {
  params: {
    id: string;
  };
}

export default function MoviePage({ params }: MoviePageProps) {
  const id = parseInt(params.id);
  
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch('/data/movies.json');
        const movies: Movie[] = await response.json();
        
        const foundMovie = movies.find(m => m.id === id);
        if (foundMovie) {
          setMovie(foundMovie);
          setIsModalOpen(true);
        } else {
          // Movie not found, redirect to home
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, router]);

  const handleClose = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <MovieDetail movie={movie} isOpen={isModalOpen} onClose={handleClose} />
  );
}
