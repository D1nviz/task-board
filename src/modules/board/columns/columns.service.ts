import type { BoardAccess } from "../boards/board-access.js";
import { ColumnNotFoundError } from "./columns.errors.js";
import type { ColumnsRepository } from "./columns.repository.js";
import type {
  ColumnCreateInput,
  ColumnDeleteInput,
  ColumnGetAllByBoardIdInput,
  ColumnGetByIdInput,
  ColumnUpdateInput,
} from "./columns.schema.js";

export class ColumnsService {
  constructor(
    private repository: ColumnsRepository,
    private boardAccess: BoardAccess,
  ) {}

  getAllByBoardId = async (params: ColumnGetAllByBoardIdInput) => {
    await this.boardAccess.assertOwned(params);
    return this.repository.getAllByBoardId(params);
  };

  getById = async (params: ColumnGetByIdInput) => {
    const [column] = await this.repository.getById(params);

    if (!column) {
      throw new ColumnNotFoundError({ columnId: params.id });
    }

    return column;
  };

  create = async ({ userId, ...data }: ColumnCreateInput) => {
    await this.boardAccess.assertOwned({ boardId: data.boardId, userId });

    const [column] = await this.repository.create(data);
    return column;
  };

  update = async (params: ColumnUpdateInput) => {
    const [column] = await this.repository.update(params);

    if (!column) {
      throw new ColumnNotFoundError({ columnId: params.id });
    }

    return column;
  };

  delete = async (params: ColumnDeleteInput) => {
    const [column] = await this.repository.delete(params);

    if (!column) {
      throw new ColumnNotFoundError({ columnId: params.id });
    }
  };
}
