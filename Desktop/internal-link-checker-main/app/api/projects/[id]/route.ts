import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// プロジェクト取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ project })
}

// プロジェクト更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  // 所有者確認
  const existingProject = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existingProject) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      sheetSettings: body.sheetSettings,
      selectors: body.selectors,
    },
  })

  return NextResponse.json({ project })
}

// プロジェクト削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // 所有者確認
  const existingProject = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existingProject) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.project.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
