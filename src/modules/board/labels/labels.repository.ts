import { eq } from "drizzle-orm";
import type { Database } from "@/core/db/types/index.js";
import type { LabelCreateInput, LabelDeleteInput } from "./labels.schema.js";
import { labels } from "./labels.table.js";

export class LabelsRepository {
  constructor(private readonly db: Database) {}

  getAll = () => {
    return this.db.select({ id: labels.id, name: labels.name }).from(labels);
  };

  create = (data: LabelCreateInput) => {
    return this.db
      .insert(labels)
      .values(data)
      .returning({ id: labels.id, name: labels.name });
  };

  delete = ({ id }: LabelDeleteInput) => {
    return this.db
      .delete(labels)
      .where(eq(labels.id, id))
      .returning({ id: labels.id });
  };
}
