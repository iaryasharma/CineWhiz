import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

// MongoDB client setup
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Please add your Google Client ID to .env.local");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Please add your Google Client Secret to .env.local");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please add your NextAuth Secret to .env.local");
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error("Please add your NextAuth URL to .env.local");
}

const client = new MongoClient(process.env.MONGODB_URI);
export const clientPromise = client.connect();

// ✅ NextAuth options
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
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
  secret: process.env.NEXTAUTH_SECRET,
};
