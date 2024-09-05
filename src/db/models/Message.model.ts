import dynamoose from "dynamoose";
import DB_CONSTANTS from "../DB.constants";
import { BaseDbDto } from "./Base.model";

class DbMessageDto extends BaseDbDto {
  id!: string;
  chatId!: string;
  senderId!: string;
  text!: string;
  isSeen?: boolean;
}

const messageSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    id: { type: String, required: true },
    chatId: { type: String, required: true }, 
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    isSeen: { type: Boolean, default: false },
  },
  DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS
);

const MessageModel = dynamoose.model<DbMessageDto>(
  "Message",
  messageSchema,
  DB_CONSTANTS.WORKO_MODEL_TABLE_OPTIONS
);

export {MessageModel, DbMessageDto};
