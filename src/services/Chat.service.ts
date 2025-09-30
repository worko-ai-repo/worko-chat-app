// import dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import daos
import { chatDaoObj } from "../daos/Chat.dao";

// import dtos
import { ChatMembersDto } from "../dtos/Chat.dto";

// import models
import { DbChatDto } from "../db/models/Chat.model";

// chat service class with chat related methods like creating new chat between two users, deleting chat between two users etc..
class ChatService {
  /**
   * getChatMembersById
   *
   * Retrieves the members of a chat by its referral ID.
   *
   * @param {string} referralId - The referral ID of the chat.
   * @return {Promise<QueryResponse<DbChatDto>>} A promise that resolves to the chat members.
   */
  async getChatMembersById(
    referralId: string
  ): Promise<QueryResponse<DbChatDto>> {
    global.logger.info("getChatMembersById in [service]", {
      referralId: referralId,
      methodName: this.getChatMembersById.name,
    });

    // get chat members by referralId
    return chatDaoObj.getChatMembersById(referralId);
  }

  /**
   * createChatMembers
   *
   * Creates a new chat members record in the Chat table.
   *
   * @param {ChatMembersDto} members - The members of the chat.
   * @return {Promise<DbChatDto>} A promise that resolves to the created chat model.
   */
  async createChatMembers(members: ChatMembersDto): Promise<DbChatDto> {
    global.logger.info("create in [service]", {
      methodName: this.createChatMembers.name,
    });

    // create new chat record
    return chatDaoObj.createChatMembers(members);
  }
}

// create chat service object 
const chatServiceObj = new ChatService();

// export chat service object and class
export { ChatService, chatServiceObj };