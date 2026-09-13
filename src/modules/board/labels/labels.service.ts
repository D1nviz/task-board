import type { LabelsRepository } from "./labels.repository.js";
import type {
  LabelCreateInput,
  LabelDeleteInput,
  LabelGetAllByBoardIdInput,
  LabelGetByIdInput,
  LabelUpdateInput,
} from "./labels.schema.js";

export class LabelsService {
  constructor(private repository: LabelsRepository) {}

  getAllByBoardId = (params: LabelGetAllByBoardIdInput) => {
    return this.repository.getAllByBoardId(params);
  };

  getById = (params: LabelGetByIdInput) => {
    return this.repository.getById(params);
  };

  create = async ({ userId, ...data }: LabelCreateInput) => {
    const [board] = await this.repository.findOwnedBoard({
      boardId: data.boardId,
      userId,
    });

    if (!board) {
      console.log("create label: board not owned", { userId, ...data });
      return [];
    }

    return this.repository.create(data);
  };

  update = async (params: LabelUpdateInput) => {
    const rows = await this.repository.update(params);
    console.log("updated label:", rows);
    return rows;
  };

  delete = async (params: LabelDeleteInput) => {
    const rows = await this.repository.delete(params);
    console.log("deleted label:", rows);
    return rows;
  };
}
