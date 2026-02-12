declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    plan?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
  }
}
