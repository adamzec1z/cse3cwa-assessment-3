-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityType" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "duration" INTEGER,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
