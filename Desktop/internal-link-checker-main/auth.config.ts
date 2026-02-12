import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Edge Runtime対応の設定（Prismaを使わない）
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/spreadsheets.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLogin = nextUrl.pathname === "/login"
      const isOnPricing = nextUrl.pathname === "/pricing"
      const isOnTerms = nextUrl.pathname === "/terms"

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true
      }

      // 料金・利用規約は未ログインでも閲覧可能
      if (isOnPricing || isOnTerms) {
        return true
      }

      // 未ログイン時はログインページへリダイレクト（キャッシュしない）
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl)
        return new Response(null, {
          status: 302,
          headers: {
            Location: loginUrl.toString(),
            "Cache-Control": "no-store, private, max-age=0",
          },
        })
      }

      return true
    },
  },
}
