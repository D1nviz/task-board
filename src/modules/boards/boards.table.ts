import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull().unique(),
  ...timestamps,
});
