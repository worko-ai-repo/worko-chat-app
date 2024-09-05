// Load daos
import { clientDaoObj } from "../daos/Client.dao";
import { messageDaoObj } from "../daos/Message.dao";

// Load dtos
import { GetMessagesListingFilterOptions, GetMessagesListingFilterRequestDTO } from "../dtos/GetMessages.dto";
import { RecordListingResponseDTO } from "../dtos/Common.dto";

// Load enums
import { SortOrderTypeEnum } from "../enums/Common.enum";
import { RouteKeyAction } from "../enums/RouteKeyAction.enum";

// Load helpers
import { RequestHelper } from "../helpers/request.helper";
import { lastKeyToBase64EncodeStr } from "../helpers/dynamoose.helper";

// Load schemas
import { getMessagesDTOValidation } from "../schemas/GetMessages.schema";

// Load utils
import { websocketUtilsObj } from "../utils/WebSocket.util";
import { RequestValidationError } from "../utils/errors.util";

const GetMessages = async (getMessagesBody: string | null) => {
  // Parse filter options from the event body
  const getMessagesRecordListingFilterRequest: GetMessagesListingFilterOptions =
    RequestHelper.parseFilterOptions<
      GetMessagesListingFilterRequestDTO,
      GetMessagesListingFilterOptions
    >(
      JSON.parse(getMessagesBody || "{}") as GetMessagesListingFilterRequestDTO
    );

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
  console.log("getMessagesData in GetMessages:", getMessagesData);

  // get all the messages by chat id
  const getMessages = await messageDaoObj.getMessages(getMessagesData);
  console.log("getMessages in GetMessages:", getMessages);

  const chatId = getMessagesData["referralId"] as string;
  console.log("chatId in GetMessages:", chatId);

  // get all the connections by chat id
  const getAllConnections = await clientDaoObj.getAllConnectionsByChatId(
    chatId
  );
  console.log("getAllConnections in GetMessages:", getAllConnections);

  // get all the connection ids
  const connectionIds: string[] = getAllConnections.map(
    (client) => client.connectionId
  );
  console.log("connectionIds in GetMessages:", connectionIds);

  // create a new message response with event name
  const messagesWithEvent = {
    ...getMessages.toJSON(),
    eventName: RouteKeyAction.getMessages,
    messageSentBy: getMessagesData["senderId"],
  };
  console.log("messagesWithEvent in GetMessages:", messagesWithEvent);

  // Get messages Response
  const getMessagesResponse: RecordListingResponseDTO = {
    data: Object.values(messagesWithEvent),
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
  console.log("getMessagesResponse in GetMessages:", getMessagesResponse);

  // send/broadcast message to all the active connections
  await websocketUtilsObj.broadcast(
    connectionIds,
    JSON.stringify(getMessagesResponse)
  );

  return {
    statusCode: 200,
    body: "",
  };
};

// export GetMessages function
export default GetMessages;