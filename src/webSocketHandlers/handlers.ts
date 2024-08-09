// load aws related modules,types
import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda";

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
import { RouteKey } from "../enums/RouteKey.enum";
import { GetMessagesDto } from "../dtos/GetMessages.dto";

// console.log("process.env.WSSAPIGATEWAYENDPOINT:",process.env.WSSAPIGATEWAYENDPOINT);
// console.log("process.env.APP_SLS_REGION:", process.env.APP_SLS_REGION);
const apigw = new ApiGatewayManagementApiClient({
  region: process.env.APP_SLS_REGION,
  endpoint: process.env.WSSAPIGATEWAYENDPOINT,
});
// console.log("apigw:", apigw);

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
    const awsError = e as AWSError;
    // console.log("awsError:", awsError);
    console.log("awsError.name:", awsError.name);
    // console.log("tyeof awsError.name:", typeof awsError.name);

    // Check if the status code is 410
    return awsError.name === "410";
  }

  async getMessagesByChatId(chatId: string) {
    console.log("getMessagesByChatId in [handler]");
    const messages = await messageDaoObj.getMessagesByChatId(chatId);
    if (messages.count === 0) {
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
    // console.log(messagesWithUser, "messagesWithUser");

    return messagesWithUser;
  }

  async checkClientExists(connectionId: string): Promise<DbClientDto> {
    console.log("checkClientExists in [handler]");
    // first get the client
    const getClient = await clientDaoObj.getClientByConnectionId(connectionId);

    //if no client found throw error, @todo use BaseError class
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
    console.log("getAllChats in [handler]");
    return chatDaoObj.getAllChats();
  }

  /**
   * Retrieves all chats from the database that contain the specified user ID.
   *
   * @param {string} userId - The ID of the user to filter by.
   */
  async getChatRecordsByUserId(userId: string) {
    console.log("getChatRecordsByUserId in [handler]");
    const AllChats = await this.getAllChats();

    const filteredChats = AllChats.filter((chat: DbChatDto) => {
      return chat.members.includes(userId);
    });

    if (filteredChats.length === 0) {
      return [];
    }

    // Filter chats based on userId and exclude the given userId from members
    const filteredChatsExceptionUserId = filteredChats.map(
      (chat: DbChatDto) => {
        const members = chat.members.filter((memberId) => memberId !== userId);
        return {
          ...chat,
          colleagueUserId: members[0],
        };
      }
    );

    const colleagueUserIdWithDetails = await Promise.all(
      filteredChatsExceptionUserId.map(async (chat) => {
        const user = await userDaoObj.getUserById(chat.colleagueUserId);
        return { ...chat, name: user[0].name, email: user[0].email };
      })
    );

    return colleagueUserIdWithDetails;
  }

  async retrieveChatMembers(connectionId: string) {
    console.log("retrieveChatMembers in [handler]");
    // get client by given connectionId
    const retrivedClient = await this.checkClientExists(connectionId);

    // use userId from the returned clientDetail to get all chat clients/members associated with connected userId
    const userId = retrivedClient.userId;
    const chatMembers = await this.getChatRecordsByUserId(userId);
    return { chatMembers, userId };
  }

  /**
   * postToTheConnection
   *
   * Sends a message to a WebSocket connection.
   * @todo - use "postToTheConnection" code in "utils" or "helpers" folder
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
    // console.log("apigw in postToTheConnection:", apigw);
    try {
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: messageBody,
      }); // create the post command

      await apigw.send(postToConnectionCommand); // post the message to the connection

      return true;
    } catch (error) {
      console.log(`connectionId: ${connectionId} in catch block of postToTheConnection`);
      // if the error related to connection not exist then delete the client/connection id from the database
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

  /**
   * broadcast
   * 
   * Broadcasts a message to multiple WebSocket connections.
   *
   * @todo - use "broadcast" code in "utils" or "helpers" folder
   * @param {string[]} connectionIds - Array of connection IDs to broadcast the message.
   * @param {string} messageBody - The message to broadcast.
   */
  async broadcast(connectionIds: string[], messageBody: string) {
    console.log("broadcast in [handler]");
    for (const connectionId of connectionIds) {
      await this.postToTheConnection(connectionId, messageBody);
    }
  }

  async notifyChatMates(connectionId: string, isOnline: boolean) {
    console.log("notifyChatMates in [handler]");

    // retrieve userIds of chatting friends/chattingMates for connected client/user/candidate/employee
    const { chatMembers, userId } = await this.retrieveChatMembers(connectionId);

    if (chatMembers.length === 0) {
      // No chat mates to notify
      return;
    }

    const onlineStatus = {
      userId,
      isOnline,
      chatMembers,
      eventName: isOnline ? RouteKey.connect : RouteKey.disconnect,
    };

    for (const chatMate of chatMembers) {
      console.log("chatMate in notifyChatMates for loop:", chatMate);
      // get userId of chat mate
      const chatMateUserId = chatMate.colleagueUserId;

      // get connectionIds of chat mate using userId
      const chatMateConnectionIds = await clientDaoObj.getAllConnectionsByUserId(chatMateUserId);
      console.log("chatMateConnectionIds in notifyChatMates count:",chatMateConnectionIds.count);

      // if no connections found for the chat mate then continue to next chat mate
      if (!chatMateConnectionIds.count) {
        continue;
      }

      // get array of connectionIds of chat mate
      const connectionIds = chatMateConnectionIds.map(
        (chatMateConnectionId) => chatMateConnectionId.connectionId
      );

      // broadcast online/offline status to all connections of chat mate
      await this.broadcast(connectionIds, JSON.stringify(onlineStatus));
    }
  }

  async handleConnect(
    connectionId: string,
    queryStringParameters: APIGatewayProxyEventQueryStringParameters | null
  ) {
    console.log("handleConnect in [handler]");

    // @todo use validation using Joi in schemas folder
    if (
      !queryStringParameters ||
      !queryStringParameters["userId"] ||
      typeof queryStringParameters["userId"] !== "string"
    ) {
      throw new Error("queryStringParameters not found");
    }

    // get userId from queryStringParameters
    const userId = queryStringParameters["userId"] as string;

    // create a new client
    await clientDaoObj.createClient(connectionId, userId);

    // Notify chat mates that this user is online
    await this.notifyChatMates(connectionId, true);

    return responseOK;
  }

  async handleDisconnect(connectionId: string) {
    console.log("handleDisconnect in [handler]");
    /*
    Refer Below docs for how to delete Item in dynamodb using dynamoose:-
    https://dynamoosejs.com/guide/Item#itemdeletecallback
    */
    const retrivedClient = await this.checkClientExists(connectionId);

    await clientDaoObj.deleteClientByConnectionId(retrivedClient);

    // Notify chat mates that this user is offline
    await this.notifyChatMates(connectionId, false);

    return responseOK;
  }

  async handleGetClients(connectionId: string) {
    console.log("handleGetClients in [handler]");
    const { chatMembers } = await this.retrieveChatMembers(connectionId);

    const chatMembersWithEvent = {
      chatMembers: [...chatMembers],
      eventName: RouteKey.getClients,
    };

    // return all chat clients/members associated with this userId
    const isChatMembersSent = await this.postToTheConnection(
      connectionId,
      JSON.stringify(chatMembersWithEvent)
    );

    if (!isChatMembersSent) {
      return responseForbidden;
    }
    return responseOK;
  }

  async handleSendMessage(sendMessageBody: string | null) {
    console.log("handleSendMessage in [handler]");

    const sendMessage: NewMessageDto = JSON.parse(
      sendMessageBody || "{}"
    ).messageData;
    if (
      !sendMessage ||
      !sendMessage.text ||
      !sendMessage.chatId ||
      !sendMessage.senderId
    ) {
      throw new Error("Message body not found");
    } // @todo use schemas folder and do validation using joi

    // create a new message record in Message model
    await messageDaoObj.addMessage(sendMessage);

    // retrieve the reciever's  specific chat by using chatId
    const specificChatDetail = await chatDaoObj.getChatById(sendMessage.chatId);

    // if chat record is not found, return responseForbidden
    if (!specificChatDetail.count || specificChatDetail.count === 0) {
      return responseForbidden; // @todo discuss with project lead:- implement error handling like not found
    }

    const receiverIdData: string[] = specificChatDetail[0].members.filter(
      (userId: string) => userId !== sendMessage.senderId
    );

    // get the reciever's userId from the chat record
    const receiverId = receiverIdData[0];

    // get the reciever's all connectionid's
    const receiverConnections = await clientDaoObj.getAllConnectionsByUserId(
      receiverId
    );

    const sendMessageWithEvent = {
      ...sendMessage,
      eventName: RouteKey.sendMessage,
    };

    const connectionIds = receiverConnections.map(receiverConnection=>
      receiverConnection.connectionId
    )

    // send/broadcast message to all the reciever's connections
    await this.broadcast(connectionIds, JSON.stringify(sendMessageWithEvent));

    return responseOK;
  }

  async handleGetMessages(getMessagesBody: string | null) {
    console.log("handleGetMessages in [handler]");

    const getMessagesEventBody: GetMessagesDto = JSON.parse(
      getMessagesBody || "{}"
    );
    if (
      !getMessagesEventBody ||
      !getMessagesEventBody.chatId ||
      typeof getMessagesEventBody.chatId !== "string" ||
      !getMessagesEventBody.senderId ||
      typeof getMessagesEventBody.senderId !== "string"
    ) {
      throw new Error("Get messages event body not found");
    } // @todo use schema validation using joi

    // @todo implement pagination for messages(example:-view latest 10 messages)

    const chatId = getMessagesEventBody["chatId"] as string;

    const messages = await this.getMessagesByChatId(chatId);

    const messagesWithEvent = {
      messages: [...messages],
      chatId: chatId,
      eventName: RouteKey.getMessages,
    };

    // get the sender's all connectionid's
    const senderConnections = await clientDaoObj.getAllConnectionsByUserId(
      getMessagesEventBody.senderId
    );

    const connectionIds = senderConnections.map(senderConnection=>
      senderConnection.connectionId
    )

    await this.broadcast(connectionIds, JSON.stringify(messagesWithEvent));

    return responseOK;
  }
}

const handlerObj = new Handlers();
export { Handlers, handlerObj };
