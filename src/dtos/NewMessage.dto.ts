
export interface NewMessageDto {
  chatId: string; // "id" attribute from ChatModel present in db/models/Chat.model
  senderId: string;
  text: string;
}