// import Joi library
import Joi from "joi";

// import enums
import { RouteKeyActionEnum } from "../enums/Common.enum";

// Define validation schema for route key action
export const ChatHandlerValidation = Joi.object({
  routeKey: Joi.string()
    .required()
    .valid(...Object.values(RouteKeyActionEnum))
    .messages({
      "any.only": `Invalid route key action. Please provide a valid value from
      ${Object.values(RouteKeyActionEnum).join(", ")}.`,
    }),
});
