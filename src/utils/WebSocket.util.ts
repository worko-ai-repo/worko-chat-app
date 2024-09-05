// load aws related modules and types
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { AWSError } from "aws-sdk";

// import dotenv library
import dotenv from "dotenv";
dotenv.config();

// load daos
import { clientDaoObj } from "../daos/Client.dao";

// load models
import { DbClientDto } from "../db/models/Client.model";

class WebSocketUtils {
  /**
   * Checks if the given error represents a connection not exist error.
   *
   * Refer docs:-https://www.geeksforgeeks.org/what-is-public-static-const-in-typescript/
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
    console.log("isConnectionNotExistError in [WebSocketUtils]");

    const awsError = e as AWSError;
    console.log("awsError in [WebSocketUtils]:", awsError);
    console.log("awsError.name in [WebSocketUtils]:", awsError.name);

    // While running the app in local pc awsError.name will be "410" and when deployed to AWS awsError.name will be "GoneException"
    return awsError.name === "410" || awsError.name === "GoneException";
  }

  /**
   * Sends a message to a WebSocket connection.
   *
   * Refer docs:-https://www.geeksforgeeks.org/what-is-public-static-const-in-typescript/
   *
   * The static the keyword indicates that the constant is associated with the class itself,
   * not with instances of the class. It means you can access the constant using the class name
   * without creating an instance. For example, if you have a class MyClass with a static
   * constant i.e. MY_CONSTANT, you can access it MyClass.MY_CONSTANT without creating an instance
   * of MyClass.
   *
   * @param {string} connectionId - The ID of the WebSocket connection.
   * @param {string} messageBody - The message to send.
   * @return {Promise<boolean>} A promise that resolves to `true` if the message was sent successfully, or `false` if the connection no longer exists.
   */
  static async postToTheConnection(
    connectionId: string,
    messageBody: string
  ): Promise<boolean> {
    try {
      console.log("postToTheConnection in [WebSocketUtils]");

      console.log(
        "WSSAPIGATEWAYENDPOINT in [WebSocketUtils]:",
        process.env.WSSAPIGATEWAYENDPOINT
      );
      console.log(
        "APP_SLS_REGION in [WebSocketUtils]:",
        process.env.APP_SLS_REGION
      );

      // Initializes the API Gateway client to manage WebSocket connections using the specified region and endpoint.
      const apigw = new ApiGatewayManagementApiClient({
        region: process.env.APP_SLS_REGION,
        endpoint: process.env.WSSAPIGATEWAYENDPOINT,
      });
      console.log("apigw in [WebSocketUtils]:", apigw);

      // Constructs a PostToConnectionCommand to send a message to the specified WebSocket connection.
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: messageBody,
      });
      console.log("postToConnectionCommand:", postToConnectionCommand);

      // post the message to the connection
      await apigw.send(postToConnectionCommand);

      // return true if the message was sent or posted successfully
      return true;
    } catch (error) {
      if (WebSocketUtils.isConnectionNotExistError(error)) {
        const getClientByConnectionId =
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
   * Broadcasts a message to multiple WebSocket connections.
   *
   * @param {string[]} connectionIds - Array of connection IDs to broadcast the message.
   * @param {string} messageBody - The message to broadcast.
   */
  async broadcast(connectionIds: string[], messageBody: string) {
    console.log("broadcast in [WebSocketUtils]");
    for (const connectionId of connectionIds) {
      await WebSocketUtils.postToTheConnection(connectionId, messageBody);
    }
  }
}

// export the instance of WebSocketUtils
const websocketUtilsObj = new WebSocketUtils();

// export the class WebSocketUtils and the instance of it
export { WebSocketUtils, websocketUtilsObj };