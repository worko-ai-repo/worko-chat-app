// load libraries and types from aws-lambda package
import { APIGatewayProxyResult } from "aws-lambda";

// APIGatewayProxyResponse class for api gateway proxy response
class APIGatewayProxyResponse {
  /**
   * webSocketProxyResult
   *
   * This response is intended for API Gateway, which manages the WebSocket connection between the client and the Lambda function. The flow of interaction is as follows:
   *
   * 1. **Client WebSocket Connection**: The client (e.g., a browser or WebSocket client) sends a message to the WebSocket API. This request is routed through **API Gateway**.
   *
   * 2. **Lambda Function Invocation**: API Gateway invokes your Lambda function (e.g., `getMessages`, `sendMessage`, `$connect`, `$disconnect`, `$default`), passing the event data (e.g., WebSocket message or connection event) to it.
   *
   * 3. **Lambda Response**: The `webSocketProxyResult` object is sent back to **API Gateway**. API Gateway uses this response to handle any further communication or error handling on its side.
   *
   * **Note**: Since WebSocket communication is bidirectional, this response is not directly sent to the client but is primarily for API Gateway to acknowledge the request.
   *
   * @type {APIGatewayProxyResult} - The response object for the WebSocket API.
   * @property {number} statusCode - The HTTP status code for the response. Typically set to `200` (OK), indicating a successful operation.
   * @property {string} body - The response body. In most cases, this is an empty string since no body content is returned.
   */
   static webSocketProxyResponse = function (
     statusCode: number,
     body: string
   ): APIGatewayProxyResult {
      return {
        statusCode: statusCode,
        body: body
      }
   }
}

// create an instance of the APIGatewayProxyResponse class
const apiGatewayProxyResponseObj = new APIGatewayProxyResponse();

// export APIGatewayProxyResponse class and instance object of it
export { apiGatewayProxyResponseObj, APIGatewayProxyResponse };