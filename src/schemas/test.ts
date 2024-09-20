// import Joi library
import Joi from "joi";

// import enums
import { RouteKeyAction } from "../enums/RouteKeyAction.enum";

// Define validation schema for route key action
export const ChatHandlerValidation = Joi.object({
  routeKey: Joi.string()
    .required()
    .valid(...Object.values(RouteKeyAction))
    .messages({
      "any.only": `Invalid route key action. Please provide a valid value from
      ${Object.values(RouteKeyAction).join(", ")}.`,
    }),
});
