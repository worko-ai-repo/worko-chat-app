// Import and execute the database configuration file to set up the database connection
import "./configs/dbConfig";

// Load necessary modules
import { APIGatewayProxyEvent } from "aws-lambda";

// load enums
import { RouteKeyAction } from "./enums/RouteKeyAction.enum";

// load handlers
import Connect from "./wss-handlers/Connect.wss-handler";
import Disconnect from "./wss-handlers/Disconnect.wss-handler";
import SendMessage from "./wss-handlers/SendMessage.wss-handler";
import GetMessages from "./wss-handlers/GetMessages.wss-handler";

// load schemas
import { ChatHandlerValidation } from "./schemas/ChatHandler.schema";

// load utils
import { RequestValidationError } from "./utils/errors.util";

export const chatHandler = async (event: APIGatewayProxyEvent) => {
  console.log("event:", event);

  /*
  The connection ID will be available in the request context, 
  which is provided by the API Gateway when connecting to the WebSocket API 
  */
  const connectionId = event.requestContext.connectionId as string;
  console.log("connectionId in [chatHandler]:", connectionId);

  // Extract the route key from the event
  const routeKey = event.requestContext.routeKey as RouteKeyAction;
  console.log("routeKey in [chatHandler]:", routeKey);

  // Validate the incoming route key and throw an error if it's invalid
  const { error, value: routeKeyAction } = ChatHandlerValidation.validate(
    { routeKey },
    {
      abortEarly: false,
    }
  );
  if (error) {
    throw new RequestValidationError(error);
  }
  console.log("routeKeyAction in [chatHandler]:", routeKeyAction); 

  switch (routeKeyAction.routeKey) {
    case RouteKeyAction.connect:
      return Connect(connectionId, event.queryStringParameters); // WebSocket connections do not natively support path parameters,you can send the userId in the connection URL as a query parameter
    case RouteKeyAction.disconnect:
      return Disconnect(connectionId);
    case RouteKeyAction.sendMessage:
      return SendMessage(event.body);
    case RouteKeyAction.getMessages:
      return GetMessages(event.body);
    case RouteKeyAction.default:
      return {
        statusCode: 200,
        body: "Default route executed",
      };
    default:
      return {
        statusCode: 403, // The HTTP status code '403 forbidden means you don't have permission to access this resource
        body: "",
      };
  }
};