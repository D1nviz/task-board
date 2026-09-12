import type { LabelsRepository } from "./labels.repository.js";
import type { LabelCreateBody, LabelIdParams } from "./labels.schema.js";

export class LabelsService {
  constructor(private repository: LabelsRepository) {}

  getAll = () => {
    return this.repository.getAll();
  };

  create = (data: LabelCreateBody) => {
    return this.repository.create(data);
  };

  delete = async (params: LabelIdParams) => {
    const rows = await this.repository.delete(params);
    console.log("deleted label:", rows);
    return rows;
  };
}
