import mongoose, { Schema } from 'mongoose';

const WatchlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure a user can only add a movie once
WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema);