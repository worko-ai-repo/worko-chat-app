// Load daos
import { clientDaoObj } from "../daos/Client.dao";
import { messageDaoObj } from "../daos/Message.dao";

// Load dtos
import { NewMessageDto } from "../dtos/SendMessage.dto";

// Load enums
import { RouteKeyAction } from "../enums/RouteKeyAction.enum";

// Load schemas
import { SendMessageDTOValidation } from "../schemas/SendMessage.schema";

// Load utils
import { websocketUtilsObj } from "../utils/WebSocket.util";
import { RequestValidationError } from "../utils/errors.util";

const SendMessage = async (sendMessageBody: string | null) => {

  console.log("sendMessageBody in SendMessage:", sendMessageBody);
  console.log("typeof sendMessageBody in SendMessage:", typeof sendMessageBody);

  // parse sendMessageBody 
  const sendMessage: NewMessageDto = JSON.parse(
    sendMessageBody || "{}"
  ).messageData;
  console.log("sendMessage in SendMessage:", sendMessage);
  console.log("typeof sendMessage in SendMessage:", typeof sendMessage);

  // Validate the incoming message body and throw an error if it's invalid
  const { error, value: sendMessageData } = SendMessageDTOValidation.validate(
    sendMessage,
    {
      abortEarly: false,
    }
  );
  if (error) {
    throw new RequestValidationError(error);
  }

  // create a new message record in Message model
  const newMessage = await messageDaoObj.addMessage(sendMessageData);
  console.log("newMessage in SendMessage:", newMessage);

  // get all the connections by chat id
  const getAllConnections = await clientDaoObj.getAllConnectionsByChatId(
    sendMessageData.referralId
  );
  console.log("getAllConnections in sendMessageData:", getAllConnections);

  // get all the connection ids
  const connectionIds: string[] = getAllConnections.map(
    (client) => client.connectionId
  );
  console.log("connectionIds in sendMessageData:", connectionIds);

  // create a new message response with event name
  const sendMessageDataWithEvent = {
    ...newMessage,
    eventName: RouteKeyAction.sendMessage,
  };
  console.log("sendMessageDataWithEvent in SendMessage:", sendMessageDataWithEvent);

  // send/broadcast message to all the active connections
  await websocketUtilsObj.broadcast(
    connectionIds,
    JSON.stringify(sendMessageDataWithEvent)
  );

  return {
    statusCode: 200,
    body: "",
  };
};

// export SendMessage function
export default SendMessage;