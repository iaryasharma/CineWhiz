import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import type { NextAuthOptions } from "next-auth"

// Define auth options as a separate export for reuse
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectToDatabase()

          // Check if user exists
          const existingUser = await User.findOne({ email: user.email })

          // If user doesn't exist, create new user
          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              googleId: account.providerAccountId,
            })
          } else if (!existingUser.googleId) {
            // Update existing user with Google ID if it's missing
            await User.findByIdAndUpdate(existingUser._id, {
              googleId: account.providerAccountId,
              // Update image if it's changed
              ...(user.image && { image: user.image }),
            })
          }

          return true
        } catch (error) {
          console.error("Error signing in:", error)
          // Don't fail the sign-in process on DB errors
          // This prevents the "Access Denied" error
          return true
        }
      }
      return true
    },
    async session({ session, }) {
      if (session.user) {
        try {
          await connectToDatabase()
          const dbUser = await User.findOne({ email: session.user.email })

          if (dbUser) {
            // Use type assertion to add ID to the session user
            ;(session.user as any).id = dbUser._id.toString()
          }
        } catch (error) {
          console.error("Session callback error:", error)
          // Don't fail the session on DB errors
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// Create the handler with the auth options
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
