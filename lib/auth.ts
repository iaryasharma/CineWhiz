import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

// MongoDB client setup with build-time safety
const mongoUri = process.env.MONGODB_URI;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

// Only validate environment variables at runtime, not build time
const validateEnvVars = () => {
  if (!mongoUri) {
    throw new Error("Please add your MongoDB URI to .env.local");
  }
  
  if (!googleClientId) {
    throw new Error("Please add your Google Client ID to .env.local");
  }
  
  if (!googleClientSecret) {
    throw new Error("Please add your Google Client Secret to .env.local");
  }
  
  if (!nextAuthSecret) {
    throw new Error("Please add your NextAuth Secret to .env.local");
  }
  
  if (!nextAuthUrl) {
    throw new Error("Please add your NextAuth URL to .env.local");
  }
};

// Create MongoDB client with fallback for build time
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (mongoUri) {
  client = new MongoClient(mongoUri);
  clientPromise = client.connect();
} else {
  // Fallback for build time
  clientPromise = Promise.resolve({} as MongoClient);
}

export { clientPromise };

// ✅ NextAuth options
export const authOptions: NextAuthOptions = {
  adapter: mongoUri ? MongoDBAdapter(clientPromise) : undefined,
  providers: [
    GoogleProvider({
      clientId: googleClientId || "dummy-client-id",
      clientSecret: googleClientSecret || "dummy-client-secret",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Validate environment variables at runtime
      if (process.env.NODE_ENV !== 'production') {
        validateEnvVars();
      }
      
      // When user logs in for the first time
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: nextAuthSecret || "dummy-secret-for-build",
};
