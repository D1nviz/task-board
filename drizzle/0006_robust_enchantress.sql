ALTER TYPE "public"."priority" RENAME VALUE 'hight' TO 'high';--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_name_unique" UNIQUE("name");
