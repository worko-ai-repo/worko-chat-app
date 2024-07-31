import { ulid } from "ulid";
import { NewMessageDto } from "../dtos/NewMessage.dto";
import { DbMessageDto, MessageModel } from "../db/models/Message.model";

class MessageDao {
  ModelName = "Message";
  partitionKey = "CHAT#ID#{chatId}";
  sortKey = "MSG#ID#{id}";

  /**
   * Adds a new message to the database.
   *
   * @param {NewMessageDto} newMessageBody - The new message to be added.
   * @return {Promise<DbMessageDto>} A Promise that resolves to the newly created message.
   */
  async addMessage(newMessageBody: NewMessageDto): Promise<DbMessageDto> {
    console.log("addMessage in [dao]");

    const id = ulid();
    const PK = this.partitionKey.replace("{chatId}", newMessageBody.chatId);
    const SK = this.sortKey.replace("{id}", id);

    return MessageModel.create({
      PK,
      SK,
      id,
      chatId: newMessageBody.chatId,
      senderId: newMessageBody.senderId,
      text: newMessageBody.text,
    });
  }

  async getMessagesByChatId(chatId: string) {
    console.log("getMessagesByChatId in [dao]");
    const PK = this.partitionKey.replace("{chatId}", chatId);

    return MessageModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("MSG#ID#")
      .exec();
  }
}

const messageDaoObj = new MessageDao();
export { MessageDao, messageDaoObj };