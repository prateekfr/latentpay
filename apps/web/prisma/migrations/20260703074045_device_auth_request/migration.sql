-- CreateTable
CREATE TABLE "DeviceAuthRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceAuthRequest_userCode_key" ON "DeviceAuthRequest"("userCode");

-- CreateIndex
CREATE INDEX "DeviceAuthRequest_userCode_idx" ON "DeviceAuthRequest"("userCode");
