-- DropForeignKey
ALTER TABLE "history" DROP CONSTRAINT "history_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "history" DROP CONSTRAINT "history_toUserId_fkey";

-- DropForeignKey
ALTER TABLE "tracks" DROP CONSTRAINT "tracks_currentTurnUserId_fkey";

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_currentTurnUserId_fkey" FOREIGN KEY ("currentTurnUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
