import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"

/**
 * Handle Service Account Key Management.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const site = await prisma.site.findFirst({
      where: { id, userId: session.user.id },
      include: {
        indexingKey: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json({
      key: site?.indexingKey || null,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { name, serviceAccountJson } = await req.json()

    if (!name || !serviceAccountJson) {
      return NextResponse.json(
        { error: "Name and JSON are required" },
        { status: 400 }
      )
    }

    // 1. Validate JSON structure (basic)
    try {
      const parsed = JSON.parse(serviceAccountJson)
      if (parsed.type !== "service_account") {
        throw new Error("Invalid Service Account JSON")
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format for Service Account" },
        { status: 400 }
      )
    }

    // 2. Encrypt and Store
    const encryptedJson = encrypt(serviceAccountJson)

    const key = await prisma.indexingKey.create({
      data: {
        name,
        serviceAccountJson: encryptedJson,
        userId: session.user.id,
      },
    })

    // 3. Link to Site
    await prisma.site.update({
      where: { id },
      data: { indexingKeyId: key.id },
    })

    return NextResponse.json({
      message: "Indexing Key uploaded and linked successfully",
      key: {
        id: key.id,
        name: key.name,
        createdAt: key.createdAt,
      },
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.site.update({
      where: { id, userId: session.user.id },
      data: { indexingKeyId: null },
    })

    return NextResponse.json({ message: "Key unlinked from site" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
