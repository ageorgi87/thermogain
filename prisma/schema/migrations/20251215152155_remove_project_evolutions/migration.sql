/*
  Warnings:

  - You are about to drop the `ProjectEvolutions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectEvolutions" DROP CONSTRAINT "ProjectEvolutions_projectId_fkey";

-- DropTable
DROP TABLE "ProjectEvolutions";
