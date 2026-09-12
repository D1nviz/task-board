import { timestamp } from "drizzle-orm/pg-core";

export const buildTimestamps = () => {
  return {
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
};
