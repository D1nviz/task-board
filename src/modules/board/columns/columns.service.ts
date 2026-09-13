import type { ColumnsRepository } from "./columns.repository.js";
import type {
  ColumnCreateInput,
  ColumnDeleteInput,
  ColumnGetAllByBoardIdInput,
  ColumnGetByIdInput,
  ColumnUpdateInput,
} from "./columns.schema.js";

export class ColumnsService {
  constructor(private repository: ColumnsRepository) {}

  getAllByBoardId = (params: ColumnGetAllByBoardIdInput) => {
    return this.repository.getAllByBoardId(params);
  };

  getById = (params: ColumnGetByIdInput) => {
    return this.repository.getById(params);
  };

  create = async ({ userId, ...data }: ColumnCreateInput) => {
    const [board] = await this.repository.findOwnedBoard({
      boardId: data.boardId,
      userId,
    });

    if (!board) {
      console.log("create column: board not owned", { userId, ...data });
      return [];
    }

    return this.repository.create(data);
  };

  update = async (params: ColumnUpdateInput) => {
    const rows = await this.repository.update(params);
    console.log("updated column:", rows);
    return rows;
  };

  delete = async (params: ColumnDeleteInput) => {
    const rows = await this.repository.delete(params);
    console.log("deleted column:", rows);
    return rows;
  };
}
