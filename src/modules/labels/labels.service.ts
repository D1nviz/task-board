import type { LabelsRepository } from "./labels.repository.js";
import type { LabelCreateInput, LabelDeleteInput } from "./labels.schema.js";

export class LabelsService {
  constructor(private repository: LabelsRepository) {}

  getAll = () => {
    return this.repository.getAll();
  };

  create = (data: LabelCreateInput) => {
    return this.repository.create(data);
  };

  delete = async (params: LabelDeleteInput) => {
    const rows = await this.repository.delete(params);
    console.log("deleted label:", rows);
    return rows;
  };
}
