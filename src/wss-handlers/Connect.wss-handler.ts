// import libraries and types from aws-lambda package
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";

// load daos
import { clientDaoObj } from "../daos/Client.dao";

// load helpers
import { APIGatewayProxyResponse } from "../helpers/api-gtw-proxy-result.helper";

// load schemas
import { ConnectDTOValidation } from "../schemas/Connect.schema";

// load utils
import { RequestValidationError } from "../utils/errors.util";
import { errorHandler } from "../utils/error-handler.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * connect
 * 
 * Handles WebSocket `connect` event.
 *
 * This handler is responsible for the following activities:
 * 1. Validates the incoming connection query parameters.
 * 2. Creates a new client in the Client model.
 * 3. Returns the response object for the WebSocket message event.
 *
 * @param {APIGatewayProxyEvent} event - The event object received by the Lambda function, which contains information about the WebSocket connection and the route key of the event.
 * @returns {Promise<APIGatewayProxyResult>} The response object for the WebSocket message event.
 */
const connect = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    global.logger.info("[Connect]", {
      functionName: "connect",
    });

    // Validate the incoming connection query parameters and throw an error if it's invalid
    const { error, value: connectionQueryStrParameters } =
      ConnectDTOValidation.validate(event.queryStringParameters, {
        abortEarly: false,
      });
    if (error) {
      throw new RequestValidationError(error);
    }

    // get userId from connectionQueryStrParameters
    const userId = connectionQueryStrParameters["userId"] as string;

    // get referralId from connectionQueryStrParameters
    const referralId = connectionQueryStrParameters["referralId"] as string;

    // create a new client
    await clientDaoObj.createClient(
      event.requestContext.connectionId as string,
      userId,
      referralId
    );

    // return the response object for the WebSocket message event
    return APIGatewayProxyResponse.webSocketProxyResponse(
      HttpStatusCode.OK_200,
      "Connection established successfully."
    );
  } catch (error) {
    await errorHandler.handleErrorWS(error, event);

    // Even though the error is already sent to the client via WebSocket,
    // we still need to return something for the Lambda proxy integration.
    return APIGatewayProxyResponse.webSocketProxyResponse(
      HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      "Failed to establish connection."
    );
  }
};

// export connect function
export default connect;
