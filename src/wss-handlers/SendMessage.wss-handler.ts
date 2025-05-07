// load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load libraries and types from aws-lambda package
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Load daos
import { clientDaoObj } from "../daos/Client.dao";
import { messageDaoObj } from "../daos/Message.dao";

// Load dtos
import { NewMessageDto } from "../dtos/SendMessage.dto";

// Load enums
import { RouteKeyActionEnum } from "../enums/Common.enum";

// Load helpers
import { APIGatewayProxyResponse } from "../helpers/api-gtw-proxy-result.helper";

// Load libraries
import { webSocketLibraryObj } from "../libraries/WebSocket.library";

// Load models
import { DbClientDto } from "../db/models/Client.model";
import { DbMessageDto } from "../db/models/Message.model";

// Load schemas
import { SendMessageDTOValidation } from "../schemas/SendMessage.schema";

// Load utils
import { RequestValidationError } from "../utils/errors.util";
import { errorHandler } from "../utils/error-handler.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * sendMessage
 * 
 * Handles WebSocket `sendMessage` event.
 *
 * This handler is responsible for the following activities:
 * 1. Validates the incoming message body.
 * 2. Creates a new message record in the Message model.
 * 3. Gets all the connections by chat id (referral id).
 * 4. Converts the `getAllConnections` response to an `array of strings`.
 * 5. Creates a new message response with event name.
 * 6. Sends/broadcasts the message to all the active connections including the sender and reciever.
 * 7. Constructs and returns the response object for the WebSocket message event.
 *
 * @param {APIGatewayProxyEvent} event - The event object received by the Lambda function, which contains information about the WebSocket connection and the route key of the event.
 * @returns {Promise<APIGatewayProxyResult>} - The response object for the WebSocket message event.
 */
const sendMessage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    global.logger.info("[SendMessage]");

    // parse sendMessageBody
    const sendMessage: NewMessageDto = JSON.parse(
      event.body || "{}"
    ).sendMessageData;

    // Validate the incoming message body and throw an error if it's invalid
    const { error, value: validatedSendMessageData } = SendMessageDTOValidation.validate(
      sendMessage,
      {
        abortEarly: false,
      }
    );
    if (error) {
      throw new RequestValidationError(error);
    }

    // create a new message record in Message model
    const newMessage: DbMessageDto = await messageDaoObj.addMessage(
      validatedSendMessageData
    );

    // get all the connections by chat id (referral id)
    const getAllConnections: QueryResponse<DbClientDto> =
      await clientDaoObj.getAllConnectionsByChatId(validatedSendMessageData.referralId);

    /**
     * get all the connection ids
     *
     * @todo: Investigate whether the DynamoDB (and libraries like Dynamoose) support direct `array of strings` extraction at the query level.
     */
    const connectionIds: string[] = getAllConnections.map(
      (client) => client.connectionId
    );

    // create a new message response with event name
    const sendMessageDataWithEvent: Partial<DbMessageDto> & { eventName: RouteKeyActionEnum } = {
      ...newMessage,
      eventName: RouteKeyActionEnum.sendMessage,
    };

    // send/broadcast message to all the active connections including the sender and reciever
    const broadcastResponse: boolean = await webSocketLibraryObj.broadcast(
      connectionIds,
      JSON.stringify(sendMessageDataWithEvent)
    );
    global.logger.info("broadcastResponse", broadcastResponse);

    // return the response object for the WebSocket message event
    return APIGatewayProxyResponse.webSocketProxyResponse(
      HttpStatusCode.OK_200,
      "Message sent successfully"
    ); 

  } catch (error) {
    await errorHandler.handleErrorWS(error, event);

    return APIGatewayProxyResponse.webSocketProxyResponse(
      HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      "Send message failed"
    );
  }
};

// export sendMessage function
export default sendMessage;
