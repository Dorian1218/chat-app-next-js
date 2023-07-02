import NextAuth from "next-auth/next";
import prisma from "../../../libs/prismadb"
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GooogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GooogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            authorization: {
                params: {
                  prompt: "consent",
                  access_type: "offline",
                  response_type: "code"
                }
              }
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {label: "Email", type: "text", placeholder: "Email"},
                username: {label: "Username", type: "next", placeholder: "Username"},
                password: {label: "Password", type: "next", placeholder: "Password"}
            },
            async authorize(credentials) {
                if (!credentials.email || !credentials.password) {
                    throw new Error("Please enter an email or password")
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user || !user?.hashedPassword) {
                    throw new Error("No user found")
                }

                const passwordMatch = await bcrypt.compare(credentials.password, user.hashedPassword)

                if (!passwordMatch) {
                    throw new Error("Password is incorrect")
                }

                return user
            }
        })
    ],
    secret: process.env.SECRET,
    session: {
        strategy: "jwt"
    },
    debug: process.env.NODE_ENV === "development"
}

const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}