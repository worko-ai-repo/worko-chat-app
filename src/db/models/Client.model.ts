// import dynamoose library
import dynamoose from "dynamoose";

// load db constants
import DB_CONSTANTS from "../DB.constants";

// import models
import { BaseDbDto } from "./Base.model";

// create db client dto which extends base db dto
class DbClientDto extends BaseDbDto {
  GSI1PK!: string;
  GSI1SK!: string;
  connectionId!: string;
  userId!: string;
}

// create dynamoose schema
const clientSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    GSI1PK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
        rangeKey: "GSI1SK",
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