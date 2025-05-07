// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// import dynamoose library
import * as dynamoose from "dynamoose";

// import dynamodb library
import { DynamoDB } from "@aws-sdk/client-dynamodb";

// `DBConfig` class to configure DynamoDB
export class DBConfig {

  /**
   * logEnv
   *
   * Logs the environment variables and their values.
   *
   * This is a function to log the environment variables and their values.
   * It's useful for debugging and testing.
   *
   * The environment variables that are logged are:
   * - STAGE
   * - APP_SLS_REGION
   * - WSSAPIGATEWAYENDPOINT
   * - APP_AWS_DYNAMODB_TABLE_NAME
   * - APP_AWS_ACCOUNT_ID
   *
   * If the stage is `local`, then the following environment variables are also logged:
   * - APP_AWS_DYNAMODB_ACCESS_KEY_ID
   * - APP_AWS_DYNAMODB_SECRET_ACCESS_KEY
   * - APP_AWS_DYNAMODB_REGION
   * - APP_AWS_DYNAMODB_ENDPOINT
   */
  static logEnv() {
    global.logger.info("`STAGE` in DB.config.ts: ",process.env.STAGE);
    global.logger.info("`APP_SLS_REGION` in DB.config.ts: ",process.env.APP_SLS_REGION);
    global.logger.info("`WSSAPIGATEWAYENDPOINT` in DB.config.ts: ",process.env.WSSAPIGATEWAYENDPOINT);
    global.logger.info("`APP_AWS_DYNAMODB_TABLE_NAME` in DB.config.ts: ",process.env.APP_AWS_DYNAMODB_TABLE_NAME);
    global.logger.info("`APP_AWS_ACCOUNT_ID` in DB.config.ts: ",process.env.APP_AWS_ACCOUNT_ID);

    if(process.env.STAGE === APP_CONSTANTS.STAGES.LOCAL) {
      global.logger.info("`APP_AWS_DYNAMODB_ACCESS_KEY_ID` in DB.config.ts: ",process.env.APP_AWS_DYNAMODB_ACCESS_KEY_ID);
      global.logger.info("`APP_AWS_DYNAMODB_SECRET_ACCESS_KEY` in DB.config.ts: ",process.env.APP_AWS_DYNAMODB_SECRET_ACCESS_KEY);
      global.logger.info("`APP_AWS_DYNAMODB_REGION` in DB.config.ts: ",process.env.APP_AWS_DYNAMODB_REGION);
      global.logger.info("`APP_AWS_DYNAMODB_ENDPOINT` in DB.config.ts: ",process.env.APP_AWS_DYNAMODB_ENDPOINT);
    }
  }

  /**
   * configureDynamoDB
   * 
   * Configure the DynamoDB client.
   *
   * If the stage is dev or prod, then use AWS DynamoDB.
   * If the stage is local, then use NoSQL Workbench for local.
   *
   * The configuration is based on the environment variables set in the .env file.
   * The configuration is used to create a new DynamoDB instance,
   * and then set the DynamoDB instance for dynamoose to use.
   */
  static configureDynamoDB() {
    let config = {};

    // If the stage is dev, then use AWS DynamoDB, the required permissions would be added in the "serverless.ts" file
    if (process.env.STAGE === APP_CONSTANTS.STAGES.DEV) {
      config = { region: process.env.APP_SLS_REGION };
    } else if (process.env.STAGE === APP_CONSTANTS.STAGES.PROD) {
      config = { region: process.env.APP_SLS_REGION };
    }
    // If the stage is not dev, then use NoSQL Workbench for local
    else {
      config = {
        region: process.env.APP_AWS_DYNAMODB_REGION,
        credentials: {
          accessKeyId: process.env.APP_AWS_DYNAMODB_ACCESS_KEY_ID!,
          secretAccessKey: process.env.APP_AWS_DYNAMODB_SECRET_ACCESS_KEY!,
        },
        endpoint: process.env.APP_AWS_DYNAMODB_ENDPOINT,
      };
    }

    // Create a new DynamoDB instance with the specified configuration
    const ddb = new DynamoDB(config);

    // Set the DynamoDB instance for dynamoose to use
    dynamoose.aws.ddb.set(ddb);
  }
}

/**
 * Call t`logEnv` function to log the environment variables and 
 * Call the `configureDynamoDB` function to configure the DynamoDB client
 */
DBConfig.logEnv();
DBConfig.configureDynamoDB();
