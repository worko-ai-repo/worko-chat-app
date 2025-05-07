/**
 * Importing classes from AWS SDK v3 to manage WebSocket connections and send messages.
 * ApiGatewayManagementApiClient is used to interact with API Gateway's WebSocket connections.
 * PostToConnectionCommand sends a message to a specific WebSocket connection.
 * 
 * Refer AWS SDK for JavaScript v3 docs:-
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dataexchange/command/CreateDataSetCommand/
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-apigatewaymanagementapi/Class/ApiGatewayManagementApiClient/
*/
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

// import dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Importing AWSError class from AWS SDK v2 to handle errors returned by AWS services.
import { AWSError } from "aws-sdk";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// load daos
import { clientDaoObj } from "../daos/Client.dao";

// load models
import { DbClientDto } from "../db/models/Client.model";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";

/**
 * WebSocketLibrary
 *
 * A utility class for managing WebSocket connections, including sending messages to connections,
 * handling connection errors, and broadcasting messages to multiple WebSocket clients.
 */
class WebSocketLibrary {
  /**
   * isConnectionNotExistError
   *
   * # Scenario: Imagine a user has a WebSocket connection open in their browser.
   * The server keeps track of this connection by storing the connection ID in a database.
   * However, if the user closes their browser without properly disconnecting (e.g., by losing internet connection),
   * then the "$disconnect" event will not be sent to the server.So that connection id is not deleted from the database.
   * then server may still think the connection is active.
   *
   * # What Happens: When the server attempts to send a message to the user through the stored connection ID,
   * an error occurs because the connection no longer exists.
   * This error can be detected by the server.
   *
   * # Detecting Inactive Connections: In the "isConnectionNotExistError" function, when the server tries to send a message to a connection,
   * it checks if the error is a "connection not exist" error (HTTP 410 or GoneException).
   * This error means the connection is no longer active.
   *
   * Checks if the given error represents a connection not exist error.
   *
   * Refer docs for public, static, private:-
   * @see https://www.geeksforgeeks.org/what-is-public-static-const-in-typescript/
   *
   * The static the keyword indicates that the constant is associated with the class itself,
   * not with instances of the class. It means you can access the constant using the class name
   * without creating an instance. For example, if you have a class MyClass with a static
   * constant i.e. MY_CONSTANT, you can access it MyClass.MY_CONSTANT without creating an instance
   * of MyClass.
   *
   * @param {unknown} e - The error to check.
   * @return {boolean} Returns true if the error represents a connection not exist error, false otherwise.
   */
  static isConnectionNotExistError(e: unknown): boolean {
    global.logger.info("isConnectionNotExistError in [WebSocketLibrary]");

    const awsError = e as AWSError;
    global.logger.info("awsError in [WebSocketLibrary]:", awsError);
    global.logger.info("awsError.name in [WebSocketLibrary]:", awsError.name);

    // While running the app in local pc awsError.name will be "410" and when deployed to AWS then awsError.name will be "GoneException"
    return awsError.name === HttpStatusCode.GONE_410.toString() || awsError.name === APP_CONSTANTS.ERRORS.NAMES.GONE_EXCEPTION;
  }

  /**
   * postToTheConnection
   *
   * Posts a message to the specified WebSocket connection.
   *
   * @param {string} connectionId - The ID of the WebSocket connection to post the message to.
   * @param {string} messageBody - The message body to post to the WebSocket connection.
   * @return {Promise<boolean>} A promise that resolves to true if the message was sent or posted successfully, false otherwise.
   */
  async postToTheConnection(
    connectionId: string,
    messageBody: string
  ): Promise<boolean> {
    try {
      global.logger.info("postToTheConnection in [WebSocketLibrary]");

      global.logger.info(
        "WSSAPIGATEWAYENDPOINT in [WebSocketLibrary]:",
        process.env.WSSAPIGATEWAYENDPOINT
      );
      global.logger.info(
        "APP_SLS_REGION in [WebSocketLibrary]:",
        process.env.APP_SLS_REGION
      );

      // Initializes the API Gateway client to manage WebSocket connections using the specified region and endpoint.
      const apigw: ApiGatewayManagementApiClient =
        new ApiGatewayManagementApiClient({
          region: process.env.APP_SLS_REGION,
          endpoint: process.env.WSSAPIGATEWAYENDPOINT,
        });

      // Constructs a PostToConnectionCommand to send a message to the specified WebSocket connection.
      const postToConnectionCommand: PostToConnectionCommand =
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: messageBody,
        });

      // post the message to the connection
      await apigw.send(postToConnectionCommand);

      // return true if the message was sent or posted successfully
      return true;
    } catch (error) {
      if (WebSocketLibrary.isConnectionNotExistError(error)) {
        /**
         * # Database Cleanup: Once the server detects this error,
         * it retrieves the client information using the connection ID from the database
         * and deletes the associated entry. This ensures the server no longer attempts to
         * send messages to that inactive connection. And won't break the WebSocket connection.
         */
        const getClientByConnectionId: QueryResponse<DbClientDto> =
          await clientDaoObj.getClientByConnectionId(connectionId);
        const retrivedClient: DbClientDto = getClientByConnectionId[0];
        await clientDaoObj.deleteClient(retrivedClient);

        return false;
      } else {
        throw error;
      }
    }
  }

  /**
   * broadcast
   *
   * Broadcasts a message to multiple WebSocket connections.
   *
   * @param {string[]} connectionIds - Array of connection IDs to broadcast the message.
   * @param {string} messageBody - The message to broadcast.
   * @returns {Promise<boolean>} A promise that resolves to true if the message was broadcasted successfully, false otherwise.
   */
  async broadcast(
    connectionIds: string[],
    messageBody: string
  ): Promise<boolean> {
    global.logger.info("broadcast in [WebSocketLibrary]");
    for (const connectionId of connectionIds) {
      await this.postToTheConnection(connectionId, messageBody);
    }

    return true;
  }
}

// export the instance of WebSocketLibrary
const webSocketLibraryObj = new WebSocketLibrary();

// export the class WebSocketLibrary and the instance of it
export { WebSocketLibrary, webSocketLibraryObj };