// Import and execute the database configuration file to set up the database connection
import "./configs/dbConfig";

import {
  APIGatewayProxyEvent,
} from "aws-lambda";

// load dtos
import { Action } from "./dtos/RouteKeyActions.dto";

// load enums
import {RouteKey} from "./enums/RouteKey.enum";

// load handlers
import { handlerObj } from "./webSocketHandlers/handlers";

const responseForbidden = {
  statusCode: 403,
  body: "",
};

export const chatHandler = async (event: APIGatewayProxyEvent) => {
  console.log("event:", event);
  const connectionId = event.requestContext.connectionId as string;
  const routeKey = event.requestContext.routeKey as Action;
  console.log("routeKey:", routeKey);
  console.log("connectionId:", connectionId);
  console.log("event.body:", event.body);
  

  switch (routeKey) {
    case RouteKey.connect:
      return handlerObj.handleConnect(connectionId,event.queryStringParameters ); // WebSocket connections do not natively support path parameters,you can send the userId in the connection URL as a query parameter
    case RouteKey.disconnect:
      return handlerObj.handleDisconnect(connectionId);
    case RouteKey.getClients:
      return handlerObj.handleGetClients(connectionId); // retrieve chats of the particular client
    case RouteKey.sendMessage:
      return handlerObj.handleSendMessage(event.body);
    case RouteKey.getMessages:
      return handlerObj.handleGetMessages(
        connectionId,
        event.body
      );
    default:
      return responseForbidden; // @todo discuss with project lead:- implement error handling like not found route
  }
};
