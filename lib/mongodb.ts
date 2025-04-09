import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Define the type for our cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Avoid using globally mutable state by properly defining the global interface
declare global {
  // eslint-disable-next-line no-var
  var mongoose: { mongoose?: MongooseCache };
}

// Creating a cached connection object
const cached: MongooseCache = global.mongoose?.mongoose || { conn: null, promise: null };

// Update the global mongoose cache
if (!global.mongoose) {
  global.mongoose = { mongoose: cached };
} else if (!global.mongoose.mongoose) {
  global.mongoose.mongoose = cached;
}

/**
 * Connect to MongoDB database
 * @returns Mongoose instance
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // If no URI is defined, throw error early
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // If we have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If no promise exists, create a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s default
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  
  return cached.conn;
}

export default connectToDatabase;