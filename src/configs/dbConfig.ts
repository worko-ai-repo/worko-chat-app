// import dotenv from 'dotenv' library
import dotenv from "dotenv";

// Load environment variables from the specified file
if (process.env.STAGE === "local") {
  dotenv.config({ path: ".env.local" });
} else if (process.env.STAGE === "dev") {
  dotenv.config({ path: ".env.dev" });
} else {
  dotenv.config({ path: ".env.local" });
}

import * as dynamoose from "dynamoose";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

console.log(
  "Environment Stage specified in serverless.yml file:",
  process.env.STAGE
); // From serverless.yml file

console.log(
  "process.env.APP_AWS_DYNAMODB_ACCESS_KEY_ID in dbConfig",
  process.env.APP_AWS_DYNAMODB_ACCESS_KEY_ID
);
console.log(
  "process.env.APP_AWS_DYNAMODB_SECRET_ACCESS_KEY in dbConfig",
  process.env.APP_AWS_DYNAMODB_SECRET_ACCESS_KEY
);
console.log(
  "process.env.APP_AWS_DYNAMODB_REGION in dbConfig",
  process.env.APP_AWS_DYNAMODB_REGION
);
console.log(
  "process.env.APP_AWS_DYNAMODB_ENDPOINT in dbConfig",
  process.env.APP_AWS_DYNAMODB_ENDPOINT
);
console.log(
  "process.env.APP_AWS_DYNAMODB_TABLE_NAME in dbConfig",
  process.env.APP_AWS_DYNAMODB_TABLE_NAME
);
console.log(
  "process.env.APP_SLS_REGION in dbConfig",
  process.env.APP_SLS_REGION
)
console.log(
  "process.env.WSSAPIGATEWAYENDPOINT in dbConfig",
  process.env.WSSAPIGATEWAYENDPOINT
)

// Configuration to connect to the DynamodDB database
let config = {};

// If the stage is dev, then use AWS DynamoDB, the required permissions would be added in the "serverless.yml" file
if (process.env.STAGE === "dev") {
  config = {
    region: process.env.APP_SLS_REGION,
  };
}
// If the stage is not dev, then use NoSQL Workbench for local dynamodb
else {
  config = {
    region: process.env.APP_AWS_DYNAMODB_REGION, // AWS region
    credentials: {
      accessKeyId: process.env.APP_AWS_DYNAMODB_ACCESS_KEY_ID!, // Access Key ID (non-null assertion)
      secretAccessKey: process.env.APP_AWS_DYNAMODB_SECRET_ACCESS_KEY!, // Secret Access Key (non-null assertion)
    },
    endpoint: process.env.APP_AWS_DYNAMODB_ENDPOINT, // APP_AWS_DYNAMODB_ENDPOINT is not defined in the production environment file. This ensures that the AWS SDK uses the default DynamoDB endpoint.
  };
}

// Create a new DynamoDB instance with the specified configuration
const ddb = new DynamoDB(config);
// Set the DynamoDB instance for dynamoose to use
dynamoose.aws.ddb.set(ddb);