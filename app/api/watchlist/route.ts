// app/api/watchlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Watchlist from '@/models/Watchlist';
import mongoose from 'mongoose';

// Get user's watchlist
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to view your watchlist' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const watchlistItems = await Watchlist.find({ 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    }).sort({ addedAt: -1 });
    
    return NextResponse.json({ watchlist: watchlistItems });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

// Add movie to watchlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to add to your watchlist' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { movieId } = body;
    
    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Check if already in watchlist
    const existing = await Watchlist.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      movieId
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Movie already in watchlist' },
        { status: 400 }
      );
    }
    
    // Add to watchlist
    const watchlistItem = new Watchlist({
      userId: new mongoose.Types.ObjectId(session.user.id),
      movieId,
      addedAt: new Date()
    });
    
    await watchlistItem.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}

// Remove from watchlist
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to remove from your watchlist' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get('movieId');
    
    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    await Watchlist.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(session.user.id),
      movieId: parseInt(movieId)
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}