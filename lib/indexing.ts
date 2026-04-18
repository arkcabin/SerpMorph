import { google } from "googleapis"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"

/**
 * Handles Google Indexing API orchestration for SaaS BYOK model.
 */

export interface IndexingResult {
  url: string
  type: string
  notifyTime: string | null
}

/**
 * Authenticate with a Service Account JSON string and publish a URL update.
 */
export async function publishIndexingRequest(
  siteId: string,
  url: string,
  serviceAccountJson: string,
  keyId?: string
): Promise<IndexingResult> {
  try {
    // 1. Handle missing key with a dev mock
    if (!serviceAccountJson && process.env.NODE_ENV === "development") {
      console.log(`[MOCK_INDEXING]: Success for ${url}`)
      await trackIndexingUsage(siteId)
      return {
        url,
        type: "URL_UPDATED",
        notifyTime: new Date().toISOString(),
      }
    }

    // 2. Decrypt and parse Service Account data
    const credentials = JSON.parse(decrypt(serviceAccountJson))

    // 2. Initialize Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    })

    const indexing = google.indexing({ version: "v3", auth })

    // 3. Send Notification to Google
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: "URL_UPDATED",
      },
    })

    // 4. Update Usage Quota
    await trackIndexingUsage(siteId, keyId)

    return {
      url: response.data.urlNotificationMetadata?.latestUpdate?.url || url,
      type:
        response.data.urlNotificationMetadata?.latestUpdate?.type ||
        "URL_UPDATED",
      notifyTime:
        response.data.urlNotificationMetadata?.latestUpdate?.notifyTime || null,
    }
  } catch (error: unknown) {
    console.error(`[INDEXING_API_ERROR]:`, error)
    const message =
      error instanceof Error ? error.message : "Failed to push to Indexing API"
    throw new Error(message)
  }
}

/**
 * Increments the indexing usage count for a site/key for the current day.
 */
export async function trackIndexingUsage(siteId: string, keyId?: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.indexingUsage.upsert({
    where: {
      siteId_date: {
        siteId,
        date: today,
      },
    },
    update: {
      count: { increment: 1 },
      keyId: keyId,
    },
    create: {
      siteId,
      date: today,
      count: 1,
      keyId: keyId,
    },
  })
}

/**
 * Gets the current usage for a site for today.
 */
export async function getTodaysUsage(siteId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const usage = await prisma.indexingUsage.findUnique({
    where: {
      siteId_date: {
        siteId,
        date: today,
      },
    },
  })

  return usage?.count || 0
}
