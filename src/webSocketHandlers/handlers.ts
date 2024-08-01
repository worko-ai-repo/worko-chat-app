
// load aws related modules,types
import {  APIGatewayProxyEventQueryStringParameters } from "aws-lambda";

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

import { AWSError } from "aws-sdk";

import dotenv from "dotenv";
dotenv.config();

// load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// load dtos
import { NewMessageDto } from "../dtos/NewMessage.dto";

// load daos
import { clientDaoObj } from "../daos/Client.dao";
import { chatDaoObj } from "../daos/Chat.dao";
import { messageDaoObj } from "../daos/Message.dao";
import { userDaoObj } from "../daos/User.dao";

// load models
import { DbClientDto } from "../db/models/Client.model";
import { DbChatDto } from "../db/models/Chat.model";

console.log(
  "process.env.WSSAPIGATEWAYENDPOINT:",
  process.env.WSSAPIGATEWAYENDPOINT
);
console.log("process.env.APP_SLS_REGION:", process.env.APP_SLS_REGION);
const apigw = new ApiGatewayManagementApiClient({
  region: process.env.APP_SLS_REGION,
  endpoint: process.env.WSSAPIGATEWAYENDPOINT,
});
console.log("apigw:", apigw);


const responseOK = {
  statusCode: 200,
  body: "",
};

const responseForbidden = {
  statusCode: 403,
  body: "",
};

class Handlers {
  /**
   * Checks if the given error represents a connection not exist error.
   *
   * @param {unknown} e - The error to check.
   * @return {boolean} Returns true if the error represents a connection not exist error, false otherwise.
   */
  isConnectionNotExistError(e: unknown): boolean {
    console.log("isConnectionNotExistError in [handler]");
    // 410 error means that connection is no longer valid
    return (e as AWSError).statusCode === 410;
  }

  async getMessagesByChatId(chatId: string) {
    const messages = await messageDaoObj.getMessagesByChatId(chatId);
    if (messages.count===0) {
      return [];
    }
    const messagesWithUser = await Promise.all(
      messages.map(async (message) => {
        const sender = await userDaoObj.getUserById(message.senderId);
        const senderName = sender[0].name;
        const senderEmail = sender[0].email;
        return { ...message, senderName, senderEmail };
      })
    );
    console.log(messagesWithUser, "messagesWithUser");

    return messagesWithUser;
  }

  async checkClientExists(connectionId: string): Promise<DbClientDto> {
    console.log("checkClientExists in [handler]");
    // first get the client
    const getClient = await clientDaoObj.getClientByConnectionId(connectionId);

    // if no client found throw error
    if (getClient.count === 0) {
      throw new Error(`No client found with connectionId: ${connectionId}`);
    }
    const retrivedClient = getClient[0];
    return retrivedClient;
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
    const AllChats = await this.getAllChats();

    const filteredChats = AllChats.filter((chat: DbChatDto) => {
      return chat.members.includes(userId);
    });
    console.log(filteredChats, "filteredChats in getChatRecordsByUserId");

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
      "filteredChatsExceptionUserId in getChatRecordsByUserId"
    );
    if (filteredChatsExceptionUserId.length === 0) {
      return [];
    }

    return filteredChatsExceptionUserId;
  }

  async retrieveChatMembers(connectionId: string) {
    // get client by given connectionId
    const retrivedClient = await this.checkClientExists(connectionId);

    // use userId from the returned clientDetail to get all chat clients/members associated with this userId
    const userId = retrivedClient.userId;
    const chatMembers = await this.getChatRecordsByUserId(userId);
    return { chatMembers, userId };
  }

  parseSendMessageBody(sendMessageBody: string | null): NewMessageDto {
    console.log("parseSendMessageBody in [handler]");
    const sendMsgBody = JSON.parse(sendMessageBody || "{}") as NewMessageDto;

    if (
      !sendMsgBody ||
      !sendMsgBody.text ||
      !sendMsgBody.chatId ||
      !sendMsgBody.senderId
    ) {
      throw new Error("Message body not found");
    }
    return sendMsgBody;
  }

  /**
   * Sends a message to a WebSocket connection.
   *
   * @param {string} connectionId - The ID of the WebSocket connection.
   * @param {string} messageBody - The message to send.
   * @return {Promise<boolean>} A promise that resolves to `true` if the message was sent successfully, or `false` if the connection no longer exists.
   */
  async postToTheConnection(
    connectionId: string,
    messageBody: string
  ): Promise<boolean> {
    console.log("postToTheConnection in [handler]");
    console.log("apigw in postToTheConnection:", apigw);
    try {
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: messageBody,
      });// create the post command
      await apigw.send(postToConnectionCommand);// post the message to the connection
      return true;
    } catch (error) {
      if (this.isConnectionNotExistError(error)) {
        const retrivedClient = await this.checkClientExists(connectionId);

        await clientDaoObj.deleteClientByConnectionId(retrivedClient);

        return false;
      } else {
        console.log("postToTheConnection else part error");
        throw error;
      }
    }
  }

  async handleConnect(
    connectionId: string,
    queryStringParameters: APIGatewayProxyEventQueryStringParameters | null
  ) {
    console.log("handleConnect in [handler]");
    console.log(
      "queryStringParameters in handleConnect:",
      queryStringParameters
    );
    console.log("connectionId in handleConnect:", connectionId);

    // Check if queryStringParameters exists, contains userId key and is a string
    if (
      !queryStringParameters || 
      !queryStringParameters["userId"] || 
      typeof queryStringParameters["userId"] !== "string"
    ) {
      console.log("queryStringParameters is not valid in handleConnect:", queryStringParameters);
      return responseForbidden; // @todo discuss with project lead:- implement error handling like given queryStringParameters is not valid
    }

    // START- DISCUSS WITH PROJECT LEAD:- Check if connectionId already exists like it is running on the web browser and exists in database
    const existingConnectionId = await clientDaoObj.getClientByConnectionId(
      connectionId
    );
    console.log("existingConnectionId in handleConnect:", existingConnectionId);

    if (
      existingConnectionId.count>0 &&
      (await this.postToTheConnection(
        connectionId,
        JSON.stringify({ type: "ping" }) // check if client is online by sending a ping message like knocking on a door
      ))
    ) {
      console.log("existingConnectionId is already connected in handleConnect:", existingConnectionId);
      return responseForbidden; // @todo discuss with project lead:- implement error handling like given connectionId is already connected
    }
    // END- DISCUSS WITH PROJECT LEAD:- Check if connectionId already exists like it is running on the web browser and exists in database

    // get userId from queryStringParameters
    const userId = queryStringParameters["userId"] as string;
    console.log("userId in handleConnect:", userId);

    // create a new client
    await clientDaoObj.createClient(connectionId, userId);

    // @todo: implement functionality:- for already websocket connected employee/candidate that this person is online/connected

    return responseOK;
  }

  async handleDisconnect(connectionId: string) {
    console.log("handleDisconnect in [handler]");

    const retrivedClient = await this.checkClientExists(connectionId);

    await clientDaoObj.deleteClientByConnectionId(retrivedClient);

    // @todo: implement functionality:- for chatting friend that this person is offline/disconnected

    return responseOK;
  }

  async handleGetClients(connectionId: string) {
    console.log("handleGetClients in [handler]");
    const { chatMembers } = await this.retrieveChatMembers(connectionId);

    // return all chat clients/members associated with this userId
    await this.postToTheConnection(connectionId, JSON.stringify(chatMembers));

    return responseOK;
  }

  async handleSendMessage(sendMessageBody: string | null) {
    console.log("handleSendMessage in [handler]");

    const sendMessage: NewMessageDto =
      this.parseSendMessageBody(sendMessageBody);

    console.log("sendMessage:", sendMessage);

    // create a new message record in Message model
    await messageDaoObj.addMessage(sendMessage);

    // retrieve the reciever's  specific chat by using chatId
    const specificChatDetail = await chatDaoObj.getChatById(sendMessage.chatId);

    // if chat record is not found, return responseForbidden
    if (!specificChatDetail.count || specificChatDetail.count === 0) {
      return responseForbidden;
    }

    const receiverIdData: string[] = specificChatDetail[0].members.filter(
      (userId: string) => userId !== sendMessage.senderId
    );

    // get the reciever's userId from the chat record
    const receiverId = receiverIdData[0];
    console.log("receiverId:", receiverId);

    // retrieve the reciever's connectionId using reciever's userId
    const recieverClient = await clientDaoObj.getClientByConnectionId(
      receiverId
    );

    // if client record is not found, return responseForbidden
    if (!recieverClient.count || recieverClient.count === 0) {
      return responseForbidden;
    }

    const receiverConnectionId = recieverClient[0].connectionId;

    // send the message to the reciever's connectionId using postToTheConnection function
    if (receiverConnectionId) {
      await this.postToTheConnection(
        receiverConnectionId,
        JSON.stringify(sendMessage)
      );
    }

    return responseOK;
  }

  async handleGetMessages(
    connectionId: string,
    queryStringParameters: APIGatewayProxyEventQueryStringParameters | null
  ) {
    console.log("handleGetMessages in [handler]");

    // @todo implement pagination for messages(example:-view latest 10 messages)

    // Check if pathParameters exists, contains chatId key and is a string
    if (
      !queryStringParameters ||
      !queryStringParameters["chatId"] ||
      typeof queryStringParameters["chatId"] !== "string"
    ) {
      return responseForbidden;
    }

    const chatId = queryStringParameters["chatId"] as string;
    console.log("chatId:", chatId);

    const messages = await this.getMessagesByChatId(chatId);
    console.log("messages:", messages);

    await this.postToTheConnection(connectionId, JSON.stringify(messages));

    return responseOK;
  }
}

const handlerObj = new Handlers();
export { Handlers, handlerObj };
