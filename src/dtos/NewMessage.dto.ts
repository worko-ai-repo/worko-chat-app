
import { RouteKey } from "../enums/RouteKey.enum";

export interface NewMessageDto {
  action: RouteKey.sendMessage;
  chatId: string; // "id" attribute from ChatModel present in db/models/Chat.model
  senderId: string;
  text: string;
}