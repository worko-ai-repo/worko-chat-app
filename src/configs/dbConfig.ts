// Importing necessary modules
import * as dynamoose from "dynamoose";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a new DynamoDB instance with the specified configuration
const ddb = new DynamoDB({
  region: process.env.APP_AWS_DYNAMODB_REGION, // AWS region
  credentials: {
    accessKeyId: process.env.APP_AWS_DYNAMODB_ACCESS_KEY_ID!, // Access Key ID (non-null assertion)
    secretAccessKey: process.env.APP_AWS_DYNAMODB_SECRET_ACCESS_KEY!, // Secret Access Key (non-null assertion)
  },
  endpoint: process.env.APP_AWS_DYNAMODB_ENDPOINT, // DynamoDB endpoint
});

// Set the DynamoDB instance for dynamoose to use
dynamoose.aws.ddb.set(ddb);

 