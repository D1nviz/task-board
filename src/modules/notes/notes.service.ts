import type { NotesRepository } from "./notes.repository.js";
import type {
  NoteCreateInput,
  NoteDeleteInput,
  NoteGetAllInput,
} from "./notes.schema.js";

export class NotesService {
  constructor(private repository: NotesRepository) {}

  getAll = (params: NoteGetAllInput) => {
    return this.repository.getAll(params);
  };

  create = (data: NoteCreateInput) => {
    return this.repository.create(data);
  };

  delete = async (params: NoteDeleteInput) => {
    const rows = await this.repository.delete(params);
    console.log("deleted note:", rows);
    return rows;
  };
}
