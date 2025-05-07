// import express server
import express, { Application, Request, Response, NextFunction } from "express";

// import serverless
import serverless from "serverless-http";

// import cors
import cors from "cors";

// Import extensions
import "./extensions/string.extension";

// import libraries
import "./libraries/Logger.library";

// Import and execute the database configuration file to set up the database connection
import "./db/DB.config";

// Import middlewares
import { getAuthorizerContext } from "./middlewares/authorizer-context.middleware";

// import router
import router from "./router";

// import utils
import { errorHandler } from "./utils/error-handler.util";
import { BaseError } from "./utils/errors.util";

/**
 * App 
 * 
 * The `App` class is the main entry point of the application.
 * It initializes the middleware, routes, and error handling.
 */
class App {
  public app: Application;
  private expressPort: number;

  /**
   * Initializes the Express server and sets up the middleware, routes, and error handling.
   * Express server is set up to run on port 3000.
   * @constructor
   */
  constructor() {
    this.app = express();
    this.expressPort = 3000;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.handleUnhandledRejections();
    this.handleUncaughtExceptions();
  }

  /**
   * initializeMiddlewares
   * 
   * Initializes the middleware used by the Express server.
   * 
   * Uses CORS middleware to enable Cross-Origin Resource Sharing (CORS) with various options.
   * Parses JSON bodies with the express.json() middleware.
   */
  private initializeMiddlewares() {
    // Use CORS middleware
    this.app.use(cors());

    // Middleware to parse JSON bodies
    this.app.use(express.json());
  }

  /**
   * initializeRoutes
   * 
   * Sets up the application routes.
   * 
   * Registers the main router for handling API requests.
   * Also catches all unhandled routes and passes a 404 error to the error handling middleware.
   */
  private initializeRoutes() {
    // Router for the api express server
    this.app.use("/", router);

    // Catch all unhandled routes
    this.app.use("*", (req: Request, res: Response, next: NextFunction) => {
      const error = new BaseError(`Route '${req.originalUrl}' not found`, 404);
      next(error);
    });
  }

  /**
   * initializeErrorHandling
   * 
   * Initializes the error handling for the application.
   * 
   * Registers a middleware to handle exceptions.
   * If the error is a trusted error, it will be handled manually.
   * Otherwise, it will be passed to the Express error handler and the error would be handled by the Express exception handler.
   * It will throw error back to the user as it is an unhandled exception.
   */
  private initializeErrorHandling() {
    // Route to handle exceptions
    this.app.use(
      async (err: any, req: Request, res: Response, next: NextFunction) => {
        // Check if it is a trusted error
        if (errorHandler.isTrustedError(err)) {
          // Handle the error manually
          return errorHandler.handleError(err, res);
        }
        // Otherwise pass the error to the express and the error would be handled by the express exception handler
        // It will throw error back to the user as it is an unhandled exception.
        return next(err);
      }
    );
  }

  /**
   * handleUnhandledRejections
   * 
   * Handles unhandled promise rejections in the application.
   *
   * This method listens for unhandled promise rejections and processes them using the error handler.
   * If the error is not considered a trusted error, it will terminate the process with an exit code of 1.
   */
  private handleUnhandledRejections() {
    process.on("unhandledRejection", (error: Error, promise: Promise<any>) => {
      errorHandler.handleError(error);
      if (!errorHandler.isTrustedError(error)) {
        process.exit(1);
      }
    });
  }

  /**
   * handleUncaughtExceptions
   * 
   * Handles uncaught exceptions in the application.
   *
   * This method listens for uncaught exceptions and processes them using the error handler.
   * If the error is not considered a trusted error, it will terminate the process with an exit code of 1.
   */
  private handleUncaughtExceptions() {
    process.on("uncaughtException", (error: Error) => {
      errorHandler.handleError(error);
      if (!errorHandler.isTrustedError(error)) {
        process.exit(1);
      }
    });
  }

  /**
   * startExpressServer
   * 
   * Starts the Express server on the defined port.
   * 
   * Listens for incoming requests on the port and starts the server.
   * Logs a message to the console when the server is started.
   */
  public startExpressServer() {
    // Start the express server on the defined port
    this.app.listen(this.expressPort, () => {
      global.logger.info(
        `Express Server is running on port ${this.expressPort}`
      );
    });
  }
}

// Instantiate the App class and start the server
const appInstance = new App();
appInstance.startExpressServer();

// Export the app as a handler for AWS Lambda
export const handler = serverless(appInstance.app);
