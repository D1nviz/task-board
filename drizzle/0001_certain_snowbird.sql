DELETE FROM "boards" a USING "boards" b
WHERE a.id > b.id AND a.title = b.title;

ALTER TABLE "boards" ADD CONSTRAINT "boards_title_unique" UNIQUE("title");
