// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      /** The user's MongoDB ObjectId as a string */
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}