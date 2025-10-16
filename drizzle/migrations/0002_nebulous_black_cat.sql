CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"market_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bets" ADD COLUMN "answer_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_answers_market_id" ON "answers" USING btree ("market_id");--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_answer_markets_answer_id" ON "bets" USING btree ("answer_id");--> statement-breakpoint
ALTER TABLE "bets" DROP COLUMN "prediction";