// import express server
import express, { Application } from "express";

// import serverless 
import serverless from "serverless-http";

// import cors
import cors from "cors";

// create express server
const app: Application = express();

// Import and execute the database configuration file to set up the database connection
import "./configs/dbConfig";

// import router
import router from "./router";

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Define the port number on which the express server will run
const expressPort: number = 3000;

// Start the express server on the defined port
app.listen(expressPort, () => {
  console.log(`Express Server is running on port ${expressPort}`);
});

// router for local express server
app.use("/", router);

// Export the app as a handler for AWS Lambda
export const handler = serverless(app);