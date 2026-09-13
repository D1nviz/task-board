import type { NotesRepository } from "./notes.repository.js";
import type {
  NoteCreateInput,
  NoteDeleteInput,
  NoteGetAllInput,
  NoteGetByIdInput,
  NoteUpdateInput,
} from "./notes.schema.js";

export class NotesService {
  constructor(private repository: NotesRepository) {}

  getAll = (params: NoteGetAllInput) => {
    return this.repository.getAll(params);
  };

  getById = (params: NoteGetByIdInput) => {
    return this.repository.getById(params);
  };

  create = (data: NoteCreateInput) => {
    return this.repository.create(data);
  };

  update = async (params: NoteUpdateInput) => {
    const rows = await this.repository.update(params);
    console.log("updated note:", rows);
    return rows;
  };

  delete = async (params: NoteDeleteInput) => {
    const rows = await this.repository.delete(params);
    console.log("deleted note:", rows);
    return rows;
  };
}
