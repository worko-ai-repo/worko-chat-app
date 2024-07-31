import dynamoose from "dynamoose";
import DB_CONSTANTS from "../DB.constants";
import { BaseDbDto } from "./Base.model";


class DbChatDto extends BaseDbDto {
  // GSI1PK!: string;
  // GSI1SK!: string;
  id!: string;
  members!: string[];
}


const chatSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    // GSI1PK: {
    //   type: String,
    //   index: {
    //     name: "GSI1",
    //     rangeKey: "GSI1SK",
    //     type: "global",
    //   },
    //   required: true,
    // },
    // GSI1SK: {
    //   type: String,
    //   index: {
    //     name: "GSI1",
    //     type: "global",
    //   },
    //   required: true,
    // },
    id: { type: String, required: true },
    members: { type: Array, schema: [String], required: true }, // an array of strings
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const ChatModel = dynamoose.model<DbChatDto>("Chat", chatSchema, DB_CONSTANTS.WORKO_MODEL_TABLE_OPTIONS);

export{ ChatModel, DbChatDto };