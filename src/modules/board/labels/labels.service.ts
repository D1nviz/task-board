import type { LabelsRepository } from "./labels.repository.js";
import type {
  LabelCreateInput,
  LabelDeleteInput,
  LabelUpdateInput,
} from "./labels.schema.js";

export class LabelsService {
  constructor(private repository: LabelsRepository) {}

  getAll = () => {
    return this.repository.getAll();
  };

  create = (data: LabelCreateInput) => {
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
