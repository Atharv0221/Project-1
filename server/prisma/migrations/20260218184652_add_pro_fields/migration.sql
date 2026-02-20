-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "gender" TEXT,
    "age" INTEGER,
    "classStandard" TEXT,
    "schoolName" TEXT,
    "board" TEXT DEFAULT 'Maharashtra State Board',
    "profilePhoto" TEXT,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastLogin" DATETIME,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "scholarStatus" TEXT NOT NULL DEFAULT 'Learner',
    "rankScore" REAL NOT NULL DEFAULT 0.0,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("age", "board", "classStandard", "createdAt", "email", "gender", "id", "lastLogin", "name", "password", "profilePhoto", "rankScore", "role", "scholarStatus", "schoolName", "streak", "updatedAt", "xp") SELECT "age", "board", "classStandard", "createdAt", "email", "gender", "id", "lastLogin", "name", "password", "profilePhoto", "rankScore", "role", "scholarStatus", "schoolName", "streak", "updatedAt", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
