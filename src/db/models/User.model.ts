import dynamoose from "dynamoose";
import DB_CONSTANTS from "../DB.constants";
import { BaseDbDto } from "./Base.model";

class DbUserDto extends BaseDbDto {
  GSI1PK!: string;
  GSI1SK!: string;
  id!: string;
  name!: string;
  email!: string;
  password!: string;
}

const userSchema = new dynamoose.Schema(
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
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const UserModel = dynamoose.model<DbUserDto>(
  "User",
  userSchema,
  DB_CONSTANTS.WORKO_MODEL_TABLE_OPTIONS
);

export { UserModel, DbUserDto };
