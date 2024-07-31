// Import and execute the database configuration file to set up the database connection
import "./configs/dbConfig";

import {
  APIGatewayProxyEvent,
} from "aws-lambda";
import { Action } from "./dtos/RouteKeyActions.dto";
import { handlerObj } from "./webSocketHandlers/handlers";

const responseForbidden = {
  statusCode: 403,
  body: "",
};

export const chatHandler = async (event: APIGatewayProxyEvent) => {
  console.log("event:", event);
  console.log("event.pathParameters:", event.pathParameters);
  const connectionId = event.requestContext.connectionId as string;
  const routeKey = event.requestContext.routeKey as Action;

  const sendMessageBody: string | null = event.body;

  switch (routeKey) {
    case "$connect":
      return handlerObj.handleConnect(connectionId, event.pathParameters);
    case "$disconnect":
      return handlerObj.handleDisconnect(connectionId);
    case "getClients":
      return handlerObj.handleGetClients(connectionId); // retrieve chats of the particular client
    case "sendMessage":
      return handlerObj.handleSendMessage(sendMessageBody);
    case "getMessages":
      return handlerObj.handleGetMessages(connectionId, event.pathParameters);
    default:
      return responseForbidden;
  }
};
