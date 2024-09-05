// load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import random id generator
import { ulid } from "ulid";

// import dtos
import { NewMessageDto } from "../dtos/SendMessage.dto";
import { GetMessagesListingFilterOptions } from "../dtos/GetMessages.dto";

// import enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// load models
import { DbMessageDto, MessageModel } from "../db/models/Message.model";

class MessageDao {
  ModelName = "Message";
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
    console.log("addMessage in [dao]");
    const id = ulid();

    console.log("newMessageBody:", newMessageBody);
    console.log("typeof newMessageBody:", typeof newMessageBody);
    console.log("newMessageBody.referralId:", newMessageBody.referralId);
    console.log(
      "typeof newMessageBody.referralId:",
      typeof newMessageBody.referralId
    );
    console.log("newMessageBody.text:", newMessageBody.text);
    console.log("newMessage.senderId:", newMessageBody.senderId);

    return MessageModel.create({
      PK: this.partitionKey.replace("{chatId}", newMessageBody.referralId),
      SK: this.sortKey.replace("{id}", id),
      id: id,
      chatId: newMessageBody.referralId,
      text: newMessageBody.text,
      senderId: newMessageBody.senderId,
    });
  }

  async getMessages(
    getMessagesData: GetMessagesListingFilterOptions
  ): Promise<QueryResponse<DbMessageDto>> {
    let query = MessageModel.query("PK")
      .eq(this.partitionKey.replace("{chatId}", getMessagesData.referralId))
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

const messageDaoObj = new MessageDao();
export { MessageDao, messageDaoObj };