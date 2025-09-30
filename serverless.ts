/**
 * In place of "serverless.yml" file we are using "serverless.ts" file because we are using typescript language in
 * our entire project but ".yml" extension uses YAML language to define the structure of the Serverless configuration object.
 * To maintain consistency, we are using "serverless.ts" file which uses TypeScript language to define the structure of the
 * Serverless configuration object.
 * 
 * To use "serverless.ts" file instead of "serverless.yml" file, we must install below dependencies in devDependencies using the following command:
 * npm install -D @serverless/typescript ts-node 
 */

/**
 * Imports the `AWS` type from the `@serverless/typescript` package.
 * This type is used to define the structure of the Serverless configuration object.
 * It helps with TypeScript type checking and ensures that the configuration adheres to the expected format.
 */
import type { AWS } from "@serverless/typescript";

/**
 * Serverless configuration for the "worko-chat-api" service.
 * This configuration includes provider settings, plugins, package options, and function definitions.
 * 
 * @type {AWS}
 */
const serverlessConfiguration: AWS = {
  // The name of the Serverless service.
  service: "worko-chat-api",

  // Enables the use of the `.env` file for environment variables.
  useDotenv: true,

  /**
   * The provider settings for the Serverless service.
   */
  provider: {
    name: "aws", // Specifies AWS as the cloud provider for the service.
    runtime: "nodejs20.x", // Specifies the runtime environment for AWS Lambda functions.And Using Node.js version 20.x runtime for Lambda.
    region: "ap-south-1", // Sets the AWS region where the service will be deployed. And Deploys to the Asia Pacific (Mumbai) region.
    stage: '${opt:stage, "local"}', // Specifies the deployment stage (local by default, can be overridden).

    /**
     *
     * The memory and timeout settings for the Lambda functions.
     *
     * `memorySize` is the amount of memory (in MB) that the Lambda function can use.
     * `timeout` is the amount of time (in seconds) that the Lambda function is allowed to run.
     *
     * @todo - `memorySize` and `timeout` should be retrieved from .env file
     * @see https://www.serverless.com/framework/docs/providers/aws/guide/functions#configuration
     */
    memorySize: 512,
    timeout: 10,

    // Environment variables available to the Lambda functions.
    environment: {
      STAGE: "${self:provider.stage}", // The deployment stage is passed as an environment variable.
    },

    /**
     * Defines the IAM (Identity and Access Management) role policies to grant the Lambda functions permissions.
     */
    iamRoleStatements: [
      {
        Effect: "Allow", // Specifies that the role allows the following actions.

        /**
         * List of DynamoDB actions the Lambda functions are allowed to perform.
         */
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
        ],

        /**
         * Resources (DynamoDB tables and indexes) that the Lambda functions can access.
         */
        Resource: [
          "arn:aws:dynamodb:ap-south-1:*:table/worko",
          "arn:aws:dynamodb:ap-south-1:*:table/worko/index/GSI1",
          "arn:aws:dynamodb:ap-south-1:*:table/worko-chat",
          "arn:aws:dynamodb:ap-south-1:*:table/worko-chat/index/GSI1",
        ],
      },
    ],
  },

  /**
   * Plugins used in the Serverless configuration to enhance the build and deployment process.
   */
  plugins: [
    "serverless-dotenv-plugin", // Loads environment variables from `.env` files.
    "serverless-offline", // Enables local testing of the APIs and WebSocket events.
    "serverless-webpack", // Optimizes the build process using Webpack for packaging Lambda functions.
  ],

  package: {
    individually: true, // Each function will be packaged and deployed individually.
  },

  /**
   * Definition of Lambda functions and their associated events (WebSocket and HTTP routes).
   */
  functions: {
    /**
     * Lambda function to handle WebSocket connections and messages.
     */
    websocketHandler: {
      handler: "dist/src/chat.ChatHandler", // The location of the handler function which was compiled from typeScript to JavaScript.

      /**
       * List of WebSocket events this function handles.
       */
      events: [
        {
          websocket: {
            route: "$connect", // Handles WebSocket connection requests.
            authorizer: {
              type: "request", // Custom authorizer for WebSocket connections.
              identitySource: ["route.request.querystring.Authorization"], // The source of the identity token.
              functionName: "worko-auth", // Name of the authorizer Lambda function.
              arn: "arn:aws:lambda:ap-south-1:${env:APP_AWS_ACCOUNT_ID}:function:worko-auth", // ARN of the authorizer Lambda.
            },
          },
        },
        {
          websocket: {
            route: "$disconnect", // Handles WebSocket disconnection events.
          },
        },
        {
          websocket: {
            route: "sendMessage", // Route for sending messages over WebSocket.
          },
        },
        {
          websocket: {
            route: "getMessages", // Route for retrieving messages over WebSocket.
          },
        },
        {
          websocket: {
            route: "$default", // Default WebSocket route for unrecognized routes.
          },
        },
      ],
    },

    /**
     * Lambda function to handle REST API requests.
     */
    chatApiHandler: {
      handler: "dist/src/app.handler", // The location of the handler function which was compiled from typeScript to JavaScript.

      /**
       * HTTP events this function handles.
       */
      events: [
        {
          http: {
            path: "/{proxy+}", // Catch-all route for the REST API.
            method: "ANY", // Handles all HTTP methods (GET, POST, PUT, DELETE, etc.).
            cors: {
              origin: "*", // Allows cross-origin requests from any domain.
              headers: [
                "Content-Type",
                "X-Amz-Date",
                "Authorization",
                "X-Api-Key",
                "X-Amz-Security-Token",
                "X-Amz-User-Agent",
              ],
              allowCredentials: false, // Credentials are not required for CORS.
            },
            authorizer: {
              type: "request", // Custom authorizer for API requests.
              arn: "arn:aws:lambda:ap-south-1:${env:APP_AWS_ACCOUNT_ID}:function:worko-auth", // ARN of the authorizer Lambda.
            },
          },
        },
      ],
    },
  },
};

// Exports the Serverless configuration object.
module.exports = serverlessConfiguration;