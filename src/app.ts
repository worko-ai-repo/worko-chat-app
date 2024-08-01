import express, { Application } from "express";
// import cors from "cors";

const app: Application = express();

// Import and execute the database configuration file to set up the database connection
import "./configs/dbConfig";

import router from "./router";

// Use CORS middleware
// app.use(cors( ));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api", router);

// Define the port number on which the express server will run
const expressPort: number = 7008;

const server = app.listen(expressPort, () => {
  console.log(`Express Server is running on port ${expressPort}`);
});
