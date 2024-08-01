import dynamoose from "dynamoose";
import DB_CONSTANTS from "../DB.constants";
import { BaseDbDto } from "./Base.model";

class DbClientDto extends BaseDbDto {
  GSI1PK!: string;
  GSI1SK!: string;
  connectionId!: string;
  userId!: string;
}

const clientSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    GSI1PK: {
      type: String,
      index: {
        name: "GSI1",
        rangeKey: "GSI1SK",
        type: "global",
      },
      required: true,
    },
    GSI1SK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
      },
      required: true,
    },
    connectionId: { type: String, required: true },
    userId: { type: String, required: true }, 
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const ClientModel = dynamoose.model<DbClientDto>(
  "Client",
  clientSchema,
  DB_CONSTANTS.WORKO_MODEL_TABLE_OPTIONS
);

export { ClientModel, DbClientDto };
