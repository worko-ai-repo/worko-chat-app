// import dynamoose library
import dynamoose from "dynamoose";

// load db constants
import DB_CONSTANTS from "../DB.constants";

// import models
import { BaseDbDto } from "./Base.model";

// create chat dto which extends base db dto
class DbChatDto extends BaseDbDto {
  id!: string;
  members!: string[];
}

// create chat schema
const chatSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    id: { type: String, required: true }, // referral id will be id attribute of Chat table
    members: { type: Array, schema: [String], required: true }, // user ids will be an array of strings
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// create chat model
const ChatModel = dynamoose.model<DbChatDto>("Chat", chatSchema, DB_CONSTANTS.WORKO_MODEL_TABLE_OPTIONS);

// export chat model and DbChatDto
export{ ChatModel, DbChatDto };