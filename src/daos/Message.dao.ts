// load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import dtos
import { NewMessageDto } from "../dtos/SendMessage.dto";
import { GetMessagesListingFilterOptions } from "../dtos/GetMessages.dto";

// import enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// load models
import { DbMessageDto, MessageModel } from "../db/models/Message.model";

// load services
import UlidService from "../services/Ulid.service";

// message dao class with message related methods like creating new message, deleting message etc..
class MessageDao {
  modelName = "Message";
  partitionKey = "CHAT#ID#{chatId}";
  sortKey = "MSG#ID#{id}";

  /**
   * addMessage
   *
   * Creates a new message record in the database.
   *
   * @param {NewMessageDto} newMessageBody - The new message body to be added.
   * @return {Promise<DbMessageDto>} A promise that resolves to the newly created message model.
   */
  async addMessage(newMessageBody: NewMessageDto): Promise<DbMessageDto> {
    global.logger.info("addMessage in [dao]");

    // generate random id
    const id = UlidService.getUlidId();

    // create new message record in Message model
    return MessageModel.create({
      PK: this.partitionKey.strtr({"{chatId}": newMessageBody.referralId}),
      SK: this.sortKey.strtr({"{id}": id}),
      id: id,
      chatId: newMessageBody.referralId,
      text: newMessageBody.text,
      senderId: newMessageBody.senderId,
    });
  }

  /**
   * getMessages
   *
   * Retrieves messages from the database based on the provided chat referral ID and filter options.
   *
   * @param {GetMessagesListingFilterOptions} getMessagesData - The filter options to retrieve messages.
   * @return {Promise<QueryResponse<DbMessageDto>>} A promise that resolves to the query response containing the messages.
   */
  async getMessages(
    getMessagesData: GetMessagesListingFilterOptions
  ): Promise<QueryResponse<DbMessageDto>> {
    global.logger.info("getMessages in [dao]");

    let query = MessageModel.query("PK")
      .eq(this.partitionKey.strtr({"{chatId}": getMessagesData.referralId}))
      .where("SK")
      .beginsWith("MSG#ID#");

    // When you use the sort() method in Dynamoose, it sorts the items based on the sort key of the index you're querying.
    query = query.sort(getMessagesData.sortOrder as SortOrderTypeEnum);

    // if lastKey is provided, add it to the query where lastKey is equal to the provided value
    if (getMessagesData.lastKey) {
      // Start the query from the lastKey to retrieve subsequent pages
      query = query.startAt(getMessagesData.lastKey);
    }

    // if pageSize is provided, add it to the query
    if (getMessagesData.pageSize) {
      // Set the page size for the query
      query = query.limit(getMessagesData.pageSize);
    }

    // Execute the query and return the result
    return query.exec();
  }
}

// create an instance of MessageDao
const messageDaoObj = new MessageDao();

// export MessageDao class and messageDaoObj instance object
export { MessageDao, messageDaoObj };