// import dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import dtos
import { ChatMembersDto } from "../dtos/Chat.dto";

// load models
import { ChatModel, DbChatDto } from "../db/models/Chat.model";

// chat dao class with chat related methods like creating new chat between two users, deleting chat between two users etc..
class ChatDao {
  modelName = "Chat";
  partitionKey = "CHAT#";
  sortKey = "ID#{id}";

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
    global.logger.info("getChatMembersById in [dao]", {
      methodName: this.getChatMembersById.name,
    });

    // get chat members
    return ChatModel.query("PK")
      .eq(this.partitionKey)
      .where("SK")
      .eq(this.sortKey.strtr({"{id}": referralId}))
      .exec();
  }

  /**
   * createChatMembers
   *
   * Creates a new chat record in the database.
   *
   * @param {ChatMembersDto} members - The members of the chat.
   * @return {Promise<DbChatDto>} A promise that resolves to the created chat model.
   */
  async createChatMembers(members: ChatMembersDto): Promise<DbChatDto> {
    global.logger.info("create in [dao]");

    // get referralId from members
    const referralId: string = members.referralId;

    // create new chat record
    return ChatModel.create({
      PK: this.partitionKey,
      SK: this.sortKey.strtr({ "{id}": referralId }),
      id: referralId,
      members: [members.userIdOne, members.userIdTwo],
    });
  }
}

// create chat dao object
const chatDaoObj = new ChatDao();

// export chat dao instance object and class
export { ChatDao, chatDaoObj };