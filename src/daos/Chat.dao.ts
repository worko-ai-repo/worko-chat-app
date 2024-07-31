import { ulid } from "ulid";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

import { ChatModel, DbChatDto } from "../db/models/Chat.model";
import { ChatMembersDto } from "../dtos/Chat.dto";

class ChatDao {
  ModelName = "Chat";
  partitionKey = "CHAT#";
  sortKey = "ID#{id}";

  /**
   * create
   * Creates a new chat record in the database.
   *
   * @param {ChatMembersDto} members - The members of the chat.
   * @return {Promise<DbChatDto>} A promise that resolves to the created chat model.
   */
  async create(members: ChatMembersDto): Promise<DbChatDto> {
    console.log("create in [dao]");

    const id = ulid();
    const PK = this.partitionKey;
    const SK = this.sortKey.replace("{id}", id);
    const { senderId, receiverId } = members;

    return ChatModel.create({
      PK,
      SK,
      id,
      members: [senderId, receiverId],
    });
  }

  /**
   * Retrieves all chats from the database.
   *
   * @return {Promise<QueryResponse<DbChatDto>>} A promise that resolves to a query response containing the retrieved chats.
   */
  async getAllChats(): Promise<QueryResponse<DbChatDto>> {
    console.log("getAllChats in [dao]");

    return ChatModel.query("PK")
      .eq(this.partitionKey)
      .where("SK")
      .beginsWith("ID#")
      .exec();
  }

  async getChatById(id: string): Promise<QueryResponse<DbChatDto>> {
    console.log("getChatById in [dao]");
    const SK = this.sortKey.replace("{id}", id);
    return ChatModel.query("PK")
      .eq(this.partitionKey)
      .where("SK")
      .eq(SK)
      .exec();
  }
}

const chatDaoObj = new ChatDao();
export { ChatDao, chatDaoObj };
