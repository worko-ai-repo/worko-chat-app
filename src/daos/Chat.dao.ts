// import dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import dtos
import { ChatMembersDto } from "../dtos/Chat.dto";

// load models
import { ChatModel, DbChatDto } from "../db/models/Chat.model";

// chat dao class with chat related methods like creating new chat between two users, deleting chat between two users etc..
class ChatDao {
  ModelName = "Chat";
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
    console.log("getChatMembersById in [dao]");
    console.log("referralId in getChatMembersById [dao]:-", referralId);

    // replace id in sortKey with referralId
    const SK = this.sortKey.replace("{id}", referralId);
    console.log("SK in getChatMembersById [dao]:-", SK);

    // get chat members
    return ChatModel.query("PK")
      .eq(this.partitionKey)
      .where("SK")
      .eq(SK)
      .exec();
  }

  /**
   * create
   *
   * Creates a new chat record in the database.
   *
   * @param {ChatMembersDto} members - The members of the chat.
   * @return {Promise<DbChatDto>} A promise that resolves to the created chat model.
   */
  async create(members: ChatMembersDto): Promise<DbChatDto> {
    console.log("create in [dao]");

    console.log("members in create [dao]:-", members);

    // get referralId from members
    const referralId = members.referralId;
    console.log("referralId in create [dao]:-", referralId);

    // get partitionKey
    const PK = this.partitionKey;
    console.log("PK in create [dao]:-", PK);

    // replace id in sortKey with referralId
    const SK = this.sortKey.replace("{id}", referralId);
    console.log("SK in create [dao]:-", SK);

    // destructure senderId and receiverId from members
    const { userIdOne, userIdTwo } = members;
    console.log("userIdOne in create [dao]:-", userIdOne);
    console.log("userIdTwo in create [dao]:-", userIdTwo);

    // create new chat record
    return ChatModel.create({
      PK,
      SK,
      id: referralId,
      members: [userIdOne, userIdTwo],
    });
  }
}

// create chat dao object
const chatDaoObj = new ChatDao();

// export chat dao instance object and class
export { ChatDao, chatDaoObj };