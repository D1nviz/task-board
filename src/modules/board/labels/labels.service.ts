import { isUniqueViolation } from "@/core/db/errors.js";
import type { BoardAccess } from "../boards/board-access.js";
import { LabelNameTakenError, LabelNotFoundError } from "./labels.errors.js";
import type { LabelsRepository } from "./labels.repository.js";
import type {
  LabelCreateInput,
  LabelDeleteInput,
  LabelGetAllByBoardIdInput,
  LabelGetByIdInput,
  LabelUpdateInput,
} from "./labels.schema.js";
import { LABELS_CONSTRAINTS } from "./labels.table.js";

export class LabelsService {
  constructor(
    private repository: LabelsRepository,
    private boardAccess: BoardAccess,
  ) {}

  private isNameTaken = (error: unknown) =>
    isUniqueViolation({
      error,
      constraint: LABELS_CONSTRAINTS.boardIdNameUnique,
    });

  getAllByBoardId = async (params: LabelGetAllByBoardIdInput) => {
    await this.boardAccess.assertOwned(params);
    return this.repository.getAllByBoardId(params);
  };

  getById = async (params: LabelGetByIdInput) => {
    const [label] = await this.repository.getById(params);

    if (!label) {
      throw new LabelNotFoundError({ labelId: params.id });
    }

    return label;
  };

  create = async ({ userId, ...data }: LabelCreateInput) => {
    await this.boardAccess.assertOwned({ boardId: data.boardId, userId });

    try {
      const [label] = await this.repository.create(data);
      return label;
    } catch (error) {
      throw this.isNameTaken(error)
        ? new LabelNameTakenError({ name: data.name })
        : error;
    }
  };

  update = async (params: LabelUpdateInput) => {
    try {
      const [label] = await this.repository.update(params);

      if (!label) {
        throw new LabelNotFoundError({ labelId: params.id });
      }

      return label;
    } catch (error) {
      throw this.isNameTaken(error)
        ? new LabelNameTakenError({ name: params.name })
        : error;
    }
  };

  delete = async (params: LabelDeleteInput) => {
    const [label] = await this.repository.delete(params);

    if (!label) {
      throw new LabelNotFoundError({ labelId: params.id });
    }
  };
}
