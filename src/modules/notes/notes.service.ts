import { NoteNotFoundError } from "./notes.errors.js";
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

  getById = async (params: NoteGetByIdInput) => {
    const [note] = await this.repository.getById(params);

    if (!note) {
      throw new NoteNotFoundError({ noteId: params.id });
    }

    return note;
  };

  create = async (data: NoteCreateInput) => {
    const [note] = await this.repository.create(data);
    return note;
  };

  update = async (params: NoteUpdateInput) => {
    const [note] = await this.repository.update(params);

    if (!note) {
      throw new NoteNotFoundError({ noteId: params.id });
    }

    return note;
  };

  delete = async (params: NoteDeleteInput) => {
    const [note] = await this.repository.delete(params);

    if (!note) {
      throw new NoteNotFoundError({ noteId: params.id });
    }
  };
}
