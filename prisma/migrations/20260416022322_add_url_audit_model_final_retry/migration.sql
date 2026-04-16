-- CreateTable
CREATE TABLE "UrlAudit" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "inspectionStatus" TEXT,
    "lastCrawlTime" TIMESTAMP(3),
    "isMobileFriendly" BOOLEAN,
    "sitemap" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrlAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UrlAudit_siteId_url_idx" ON "UrlAudit"("siteId", "url");

-- AddForeignKey
ALTER TABLE "UrlAudit" ADD CONSTRAINT "UrlAudit_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
