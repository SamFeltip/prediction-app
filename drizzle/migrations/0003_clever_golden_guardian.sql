DROP INDEX "idx_markets_resolved";--> statement-breakpoint
ALTER TABLE "markets" ADD COLUMN "resolved_answer" integer;--> statement-breakpoint
CREATE INDEX "idx_answers_id" ON "markets" USING btree ("resolved_answer");--> statement-breakpoint
ALTER TABLE "markets" DROP COLUMN "resolved";