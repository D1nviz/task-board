ALTER TABLE "labels" DROP CONSTRAINT "labels_name_unique";--> statement-breakpoint
ALTER TABLE "labels" ADD COLUMN "board_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_board_id_name_unique" UNIQUE("board_id","name");