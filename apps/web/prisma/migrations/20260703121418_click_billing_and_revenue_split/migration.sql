-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advertiserId" TEXT NOT NULL,
    "adLine" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "companyName" TEXT,
    "brandIconUrl" TEXT,
    "showOnLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "surface" TEXT NOT NULL,
    "deliverySpeed" TEXT NOT NULL,
    "bidPerBlock" REAL NOT NULL,
    "numBlocks" INTEGER NOT NULL,
    "viewsPurchased" INTEGER NOT NULL,
    "viewsDelivered" INTEGER NOT NULL DEFAULT 0,
    "clicksDelivered" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Campaign" ("adLine", "advertiserId", "bidPerBlock", "brandIconUrl", "companyName", "createdAt", "deliverySpeed", "id", "numBlocks", "showOnLeaderboard", "status", "surface", "targetUrl", "updatedAt", "viewsDelivered", "viewsPurchased") SELECT "adLine", "advertiserId", "bidPerBlock", "brandIconUrl", "companyName", "createdAt", "deliverySpeed", "id", "numBlocks", "showOnLeaderboard", "status", "surface", "targetUrl", "updatedAt", "viewsDelivered", "viewsPurchased" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
CREATE INDEX "Campaign_surface_status_idx" ON "Campaign"("surface", "status");
CREATE TABLE "new_Impression" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'view',
    "durationSeconds" REAL NOT NULL,
    "cost" REAL NOT NULL DEFAULT 0,
    "payoutAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Impression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Impression_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Impression" ("campaignId", "createdAt", "durationSeconds", "id", "payoutAmount", "userId") SELECT "campaignId", "createdAt", "durationSeconds", "id", "payoutAmount", "userId" FROM "Impression";
DROP TABLE "Impression";
ALTER TABLE "new_Impression" RENAME TO "Impression";
CREATE INDEX "Impression_kind_createdAt_idx" ON "Impression"("kind", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
