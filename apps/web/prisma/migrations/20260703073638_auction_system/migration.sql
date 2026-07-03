/*
  Warnings:

  - You are about to drop the column `adCopy` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Campaign` table. All the data in the column will be lost.
  - Added the required column `email` to the `Advertiser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adLine` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bidPerBlock` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliverySpeed` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numBlocks` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surface` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viewsPurchased` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Advertiser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 500.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Advertiser" ("balance", "companyName", "createdAt", "id") SELECT "balance", "companyName", "createdAt", "id" FROM "Advertiser";
DROP TABLE "Advertiser";
ALTER TABLE "new_Advertiser" RENAME TO "Advertiser";
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
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Campaign" ("advertiserId", "id", "targetUrl") SELECT "advertiserId", "id", "targetUrl" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
CREATE INDEX "Campaign_surface_status_idx" ON "Campaign"("surface", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
