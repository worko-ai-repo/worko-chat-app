
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { chatServiceObj } from "../services/Chat.service";
import { NewMessageDto } from "../dtos/NewMessage.dto";
import { messageDaoObj } from "../daos/Message.dao";
import { DbMessageDto } from "../db/models/Message.model";
import { userDaoObj } from "../daos/User.dao";


class MessageService {
  /**
   * Asynchronously adds a new message to the database.
   *
   * @param {NewMessageDto} newMessageBody - The new message data to be added.
   * @return {Promise<DbMessageDto>} A promise that resolves to the added message data.
   */
  async addMessage(newMessageBody: NewMessageDto): Promise<DbMessageDto> {
    console.log("addMessage in [service]");

    const userChats = await chatServiceObj.getChatRecordsByUserId(
      newMessageBody.senderId
    );

    if (userChats.length === 0) {
      throw new Error("User has no chats");
    }
    const hasChatId = userChats.find((chat)=>(
        chat.id===newMessageBody.chatId
      ))

    if (!hasChatId) {
      throw new Error("User has no chat with this chatId");
    }

    return messageDaoObj.addMessage(newMessageBody);
  }

  async getMessagesByChatId(chatId: string) {
    const messages = await messageDaoObj.getMessagesByChatId(chatId);
    if (!messages) {
      return [];
    }
    const messagesWithUser = await Promise.all(
      messages.map(async (message) => {
        const sender = await userDaoObj.getUserById(message.senderId);
        const senderName = sender[0].name;
        const senderEmail = sender[0].email;
        return { ...message, senderName, senderEmail };
      })
    )
    console.log(messagesWithUser, "messagesWithUser");

    return messagesWithUser;
  }
}

const messageServiceObj = new MessageService();
export { MessageService, messageServiceObj };
