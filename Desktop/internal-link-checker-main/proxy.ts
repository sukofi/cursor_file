import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export async function proxy(request: Request) {
  // NextAuth の auth はミドルウェアとして呼ぶと Response を返す（型は Session | null と宣言されているため unknown 経由で判定）
  const result = (await auth(request as never)) as unknown
  if (result instanceof Response) {
    // 401 の場合は常に /login へリダイレクト（どのパスでもログイン画面へ）
    if (result.status === 401) {
      const redirect = NextResponse.redirect(new URL("/login", request.url))
      // 401 が CDN にキャッシュされないよう、リダイレクト側でキャッシュ禁止を明示
      redirect.headers.set("Cache-Control", "no-store, no-cache, private, max-age=0, must-revalidate")
      redirect.headers.set("Pragma", "no-cache")
      redirect.headers.set("Expires", "0")
      return redirect
    }
    // 302 などその他の Response はそのまま返す（authorized のリダイレクト含む）
    return result
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
}
