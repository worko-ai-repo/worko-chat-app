/**
 * APP_CONSTANTS
 *
 * These are the generic constants common for all applications/services.
 * For the application/service specific constants consider respective constant config file.
 */
const APP_CONSTANTS = {

  // Application default timezone
  APP_DEFAULT_TIMEZONE: process.env.TZ ?? "GMT",

  /**
   * STAGES
   * 
   * The possible stages for the application
   */
  STAGES : {
    LOCAL:"local",
    DEV:"dev",
    PROD:"prod",
  },

  // The possible options for the page sizes that is expected in the request payload.
  PAGE_LENGTH_OPTIONS: [5, 10, 25, 50, 100],

  // If "pageSize" from the request does not match with one of the "PAGE_LENGTH_OPTIONS" value, then this value would be used.
  PAGE_LENGTH_DEFAULT: 10,

  /**
   * Date formates
   */
  DATE_FORMAT_BASE_ERROR_TIMESTAMP: "ddd, DD MMM YYYY HH:mm:ss z", // Date format for the "BaseError.timeStamp" class property
  MYSQL_DATE_FORMATE: "YYYY-MM-DD", // MySQL Date formates

  /**
   * ERRORS
   */
  ERRORS: {
    NAMES: {
      GONE_EXCEPTION: "GoneException",
    }
  },

  // This is unknow exception error message
  ERROR_MESSAGE_UNKNOWN_EXCEPTION: "Something went wrong!!!",
  ERROR_MESSAGE_REQUEST_FOR_AUTHORISED_RESOURSE_ACCESS: "",
  ERROR_MESSAGE_RESOURCE_NOT_FOUND:
    "The requested resource is not found with the provided details.",
};

export default APP_CONSTANTS;