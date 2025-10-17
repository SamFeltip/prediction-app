CREATE TYPE "public"."userRoomInvite" AS ENUM('pending', 'accepted');--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"creator_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userRooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "userRoomInvite" DEFAULT 'pending' NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "markets" ADD COLUMN "room_id" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userRooms" ADD CONSTRAINT "userRooms_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userRooms" ADD CONSTRAINT "userRooms_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "markets" ADD CONSTRAINT "markets_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;