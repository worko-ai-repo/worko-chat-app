// load libraries
import "./libraries/Logger.library";

// Import and execute the database configuration file to set up the database connection
import "./db/DB.config";

/**
 * Importing APIGatewayProxyEvent type from AWS Lambda types package.
 * This type represents the structure of the event object received by Lambda functions 
 * triggered via API Gateway (WebSocket).
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// load extensions
import "./extensions/string.extension";

// Import enums
import { RouteKeyActionEnum } from "./enums/Common.enum";

// load web socket handlers
import connect from "./wss-handlers/Connect.wss-handler";
import disconnect from "./wss-handlers/Disconnect.wss-handler";
import sendMessage from "./wss-handlers/SendMessage.wss-handler";
import getMessages from "./wss-handlers/GetMessages.wss-handler";

// load helpers
import { APIGatewayProxyResponse } from "./helpers/api-gtw-proxy-result.helper";

// load schemas
import { ChatHandlerValidation } from "./schemas/ChatHandler.schema";

// load types
import { RouteKeyActionType } from "./types/WebSocket.type";

// load utils
import { RequestValidationError } from "./utils/errors.util";
import { errorHandler } from "./utils/error-handler.util";
import HttpStatusCode from "./utils/http-codes.util";

/**
 * ChatHandler
 *
 * Handles WebSocket events like $connect, $disconnect, sendMessage, getMessages, $default routes and more routes in near future.
 * The ChatHandler function is triggered by API Gateway WebSocket events,
 * which contains information about the WebSocket connection and the route key of the event.
 *
 * @param {APIGatewayProxyEvent} event The event object received by the Lambda function,
 * @throws {RequestValidationError} If the event RouteKey action is not valid.
 * @returns {Promise<APIGatewayProxyResult>} The response object for the WebSocket message event.
 */
export const ChatHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    global.logger.info("[ChatHandler]");

    /**
     * NOTE:- If any error occurs related to the websocket,
     * first check the information present in the "event" object,
     * because it contains most information about the websocket activities like
     * "connectionId","routeKey", "queryStringParameters", "body", 
     * "requestContext", "domainName", "stage", etc.
     */
    global.logger.info("'event' in [ChatHandler]:", event);

    // Extract the route key from the event
    const routeKey = event.requestContext.routeKey as RouteKeyActionType;

    // Validate the incoming route key and throw an error if it's invalid
    const { error, value: validatedRouteKey } = ChatHandlerValidation.validate(
      { routeKey },
      {
        abortEarly: false,
      }
    );
    if (error) {
      throw new RequestValidationError(error);
    }

    switch (validatedRouteKey.routeKey) {
      case RouteKeyActionEnum.connect:
        /**
         * API Gateway WebSocket connections do not natively support path parameters,
         * you can send the userId in the connection URL as a query parameter
         */
        return connect(event);
      case RouteKeyActionEnum.disconnect:
        return disconnect(event.requestContext.connectionId as string);
      case RouteKeyActionEnum.sendMessage:
        return sendMessage(event);
      case RouteKeyActionEnum.getMessages:
        return getMessages(event);
      case RouteKeyActionEnum.default:
        // return the response object for the WebSocket message event
        return APIGatewayProxyResponse.webSocketProxyResponse(
          HttpStatusCode.OK_200,
          "Default route executed"
        );
      default:
        // return the response object for the WebSocket message event
        return APIGatewayProxyResponse.webSocketProxyResponse(
          HttpStatusCode.INTERNAL_SERVER_ERROR_500,
          "Invalid route key"
        );
    }
  } catch (error) {
    await errorHandler.handleErrorWS(error,event);

    // return the response object for the WebSocket message event
    return APIGatewayProxyResponse.webSocketProxyResponse(
      HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      "Something went wrong"
    );
  }
};
