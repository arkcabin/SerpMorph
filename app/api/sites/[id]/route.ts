import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerAuthSession()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const site = await prisma.site.findUnique({
      where: { 
        id, 
        userId: session.user.id,
        deletedAt: null
      }
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error("[SITE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerAuthSession()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Verify ownership first
    const site = await prisma.site.findUnique({
      where: { id, userId: session.user.id }
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // Perform soft delete
    await prisma.site.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[SITE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
