import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

// Vercel で NEXTAUTH_SECRET のみ設定している場合も動くようフォールバック
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET

if (process.env.NODE_ENV === "production" && !secret) {
  throw new Error(
    "[NextAuth] 本番では AUTH_SECRET または NEXTAUTH_SECRET の設定が必須です。Vercel の Environment Variables を確認してください。"
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret,
  trustHost: true, // Vercel 等のプロキシ環境で必要
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      // 初回ログイン時にアクセストークンとリフレッシュトークンを保存
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      
      // トークンの有効期限チェックと更新
      if (token.expiresAt && Date.now() >= (token.expiresAt as number) * 1000 - 60000) {
        // トークンを更新
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          })
          
          const tokens = await response.json()
          
          if (!response.ok) throw tokens
          
          token.accessToken = tokens.access_token
          token.expiresAt = Math.floor(Date.now() / 1000 + tokens.expires_in)
          if (tokens.refresh_token) {
            token.refreshToken = tokens.refresh_token
          }
        } catch (error) {
          console.error("Error refreshing access token", error)
          token.error = "RefreshAccessTokenError"
        }
      }
      
      // DBからユーザーのプラン情報を取得
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true },
        })
        if (dbUser) {
          token.plan = dbUser.plan
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.plan = (token.plan as string) || "free"
        session.accessToken = token.accessToken as string
        session.error = token.error as string | undefined
      }
      return session
    },
  },
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      plan: string
    }
    accessToken?: string
    error?: string
  }
}
