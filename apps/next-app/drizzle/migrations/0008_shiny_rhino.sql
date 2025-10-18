ALTER TABLE "userRooms" DROP COLUMN "id";
ALTER TABLE "userRooms" ADD PRIMARY KEY ("newId");--> statement-breakpoint
ALTER TABLE "userRooms" ALTER COLUMN "newId" SET NOT NULL;--> statement-breakpoint