// load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Load libraries and types from aws-lambda package
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Load daos
import { messageDaoObj } from "../daos/Message.dao";

// Load dtos
import {
  GetMessagesListingFilterOptions,
  GetMessagesListingFilterRequestDTO,
} from "../dtos/GetMessages.dto";
import { RecordListingResponseDTO } from "../dtos/Common.dto";

// Load enums
import { SortOrderTypeEnum } from "../enums/Common.enum";
import { RouteKeyActionEnum } from "../enums/Common.enum";

// Load helpers
import { RequestHelper } from "../helpers/request.helper";
import { lastKeyToBase64EncodeStr } from "../helpers/dynamoose.helper";
import { APIGatewayProxyResponse } from "../helpers/api-gtw-proxy-result.helper";

// Load libraries
import { webSocketLibraryObj } from "../libraries/WebSocket.library";

// Load models
import { DbMessageDto } from "../db/models/Message.model";

// Load schemas
import { getMessagesDTOValidation } from "../schemas/GetMessages.schema";

// Load utils
import { RequestValidationError } from "../utils/errors.util";
import { errorHandler } from "../utils/error-handler.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * getMessages
 * 
 * Handles WebSocket `getMessages` event.
 *
 * This handler is responsible for the following activities:
 * 1. Validates the incoming route key and throw an error if it's invalid.
 * 2. Retrieves messages from the database based on the provided chat referral ID and filter options.
 * 3. Converts the `getMessages` response to an `RecordListingResponseDTO`.
 * 4. Posts the message to the specified active connection.
 * 5. Returns the response object for the WebSocket message event.
 *
 * @param {APIGatewayProxyEvent} event - The event object received by the Lambda function, which contains information about the WebSocket connection and the route key of the event.
 */
const getMessages = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult>  => {
  try {
    global.logger.info("[GetMessages]");

    // Parse the event body
    const parsedGetMessagesBody = JSON.parse(
      event.body || "{}"
    ).getMessagesData;

    // Parse filter options from the event body
    const getMessagesRecordListingFilterRequest: GetMessagesListingFilterOptions =
      RequestHelper.parseFilterOptions<
        GetMessagesListingFilterRequestDTO,
        GetMessagesListingFilterOptions
      >(parsedGetMessagesBody as GetMessagesListingFilterRequestDTO);

    // Validate the incoming route key and throw an error if it's invalid
    const { error, value: getMessagesData } = getMessagesDTOValidation.validate(
      getMessagesRecordListingFilterRequest,
      {
        abortEarly: false,
      }
    );
    if (error) {
      throw new RequestValidationError(error);
    }

    // get all the messages by chat id
    const getMessages: QueryResponse<DbMessageDto> =
      await messageDaoObj.getMessages(getMessagesData);

    // Get messages Response
    const getMessagesResponse: RecordListingResponseDTO = {
      data: Object.values(getMessages.toJSON()),
      eventName: RouteKeyActionEnum.getMessages,
      pagination: {
        count: getMessages.count,
        queriedCount: getMessages.queriedCount,
        pageSize: getMessagesRecordListingFilterRequest.pageSize,
        lastKey: lastKeyToBase64EncodeStr(getMessages.lastKey),
        sortOrder:
          getMessagesRecordListingFilterRequest.sortOrder ??
          SortOrderTypeEnum.DESCENDING,
      },
    };

    // post message to the specified active connection
    const broadcastResponse: boolean =
      await webSocketLibraryObj.postToTheConnection(
        event.requestContext.connectionId as string,
        JSON.stringify(getMessagesResponse)
      );
    global.logger.info("broadcastResponse: ", broadcastResponse);

    // return the response object for the WebSocket message event
    return APIGatewayProxyResponse.webSocketProxyResponse(
      HttpStatusCode.OK_200,
      "GetMessages Data successfully retrieved and sent to the client",
    );
  } catch (error) {
    await errorHandler.handleErrorWS(error,event);

    return APIGatewayProxyResponse.webSocketProxyResponse(
      HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      "GetMessages failed",
    );
  }
};

// export GetMessages function
export default getMessages;
