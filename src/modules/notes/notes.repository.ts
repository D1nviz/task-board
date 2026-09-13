import { and, eq } from "drizzle-orm";
import type { Database } from "../../core/db/types/index.js";
import type {
  NoteCreateInput,
  NoteDeleteInput,
  NoteGetAllInput,
} from "./notes.schema.js";
import { notes } from "./notes.table.js";

export class NotesRepository {
  constructor(private readonly db: Database) {}

  getAll = ({ userId }: NoteGetAllInput) => {
    return this.db
      .select({
        id: notes.id,
        title: notes.title,
        description: notes.description,
      })
      .from(notes)
      .where(eq(notes.userId, userId));
  };

  create = (data: NoteCreateInput) => {
    return this.db.insert(notes).values(data).returning({
      id: notes.id,
      title: notes.title,
      description: notes.description,
    });
  };

  delete = ({ id, userId }: NoteDeleteInput) => {
    return this.db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning({ id: notes.id });
  };
}
