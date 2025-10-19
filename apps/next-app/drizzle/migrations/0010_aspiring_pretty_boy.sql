DROP TABLE "user_points" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;