// load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// load daos
import { clientDaoObj } from "../daos/Client.dao";

// load helpers
import { APIGatewayProxyResponse } from "../helpers/api-gtw-proxy-result.helper";

// load models
import { DbClientDto } from "../db/models/Client.model";

// load utils
import HttpStatusCode from "../utils/http-codes.util";

/**
 * disconnect
 *
 * WebSocket handler for the $disconnect route.
 *
 * Retrieves the client from the database based on the provided connection ID 
 * and then deletes the client from the database.
 *
 * @param {string} connectionId - The connection ID of the user.
 */
const disconnect = async (connectionId: string) => {
  global.logger.info("[Disconnect]", {
    functionName: "disconnect",
  });

  // check if the client exists by getting the client by connectionId
  const getClientByConnectionId: QueryResponse<DbClientDto> =
    await clientDaoObj.getClientByConnectionId(connectionId);

  // get the retrivedClient from the getClientByConnectionId
  const retrivedClient: DbClientDto = getClientByConnectionId[0];

  // delete the client
  await clientDaoObj.deleteClient(retrivedClient);

  // return the response object for the WebSocket message event
  return APIGatewayProxyResponse.webSocketProxyResponse(
    HttpStatusCode.OK_200,
    "Disconnected successfully" 
  );
};

// export disconnect function
export default disconnect;