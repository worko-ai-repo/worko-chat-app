import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { chatDaoObj } from "../daos/Chat.dao";
import { DbChatDto } from "../db/models/Chat.model";
import { ChatMembersDto } from "../dtos/Chat.dto";

class ChatService {
  /**
   * Creates a new chat record in the database.
   *
   * @param {ChatMembersDto} members - The members of the chat.
   * @return {Promise<DbChatDto>} A promise that resolves to the created chat model.
   */
  async create(members: ChatMembersDto): Promise<DbChatDto> {
    console.log("create in [service]");

    return chatDaoObj.create(members);
  }

  /**
   * Retrieves all chats from the database.
   *
   * @return {Promise<QueryResponse<DbChatDto>>} A promise that resolves to an array of chat models.
   */
  async getAllChats(): Promise<QueryResponse<DbChatDto>> {
    console.log("getAllChats in [service]");
    return chatDaoObj.getAllChats();
  }

  /**
   * Retrieves all chats from the database that contain the specified user ID.
   *
   * @param {string} userId - The ID of the user to filter by.
   */
  async getChatRecordsByUserId(userId: string) {
    console.log("getChatRecordsByUserId in [service]");

    const AllChats = await this.getAllChats();
    console.log(AllChats, "AllChats in getChatRecordsByUserId [service]");

    const filteredChats = AllChats.filter((chat: DbChatDto) => {
      return chat.members.includes(userId);
    });
    console.log(
      filteredChats,
      "filteredChats in getChatRecordsByUserId [service]"
    );

    if (filteredChats.length === 0) {
      return [];
    }

    // Filter chats based on userId and exclude the given userId from members
    const filteredChatsExceptionUserId = filteredChats.map(
      (chat: DbChatDto) => {
        return {
          ...chat,
          members: chat.members.filter((memberId) => memberId !== userId),
        };
      }
    );
    console.log(
      filteredChatsExceptionUserId,
      "filteredChatsExceptionUserId in getChatRecordsByUserId [service]"
    );
    if (filteredChatsExceptionUserId.length === 0) {
      return [];
    }

    return filteredChatsExceptionUserId;
  }

  /**
   * Retrieves a specific chat from the database that contains the specified user IDs.
   *
   * @param {string} firstId - The ID of the first user.
   * @param {string} secondId - The ID of the second user.
   * @return {Promise<DbChatDto[]>} A promise that resolves to an array of chat models that contain the specified user IDs.
   */
  async getSpecificChatByUserId(
    firstId: string,
    secondId: string
  ): Promise<DbChatDto[]> {
    console.log("getSpecificChatByUserId in [service]");
    const AllChats = await this.getAllChats();
    console.log(AllChats, "AllChats in getSpecificChatByUserId [service]");

    const specificChat = AllChats.find((chat: DbChatDto) => {
      return chat.members.includes(firstId) && chat.members.includes(secondId);
    });
    console.log(
      specificChat,
      "specificChat in getSpecificChatByUserId [service]"
    );
    if (!specificChat) {
      return [];
    }
    return [specificChat];
  }
}

const chatServiceObj = new ChatService();
export { ChatService, chatServiceObj };