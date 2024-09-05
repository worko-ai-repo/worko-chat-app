// import Joi library
import Joi from "joi";

// import common schema
import { commonSchema } from "./Common.schema";

export const getMessagesDTOValidation = commonSchema.concat(
  Joi.object({
    referralId: Joi.string().required().messages({
      "string.base": `"referralId" should be a type of 'string'`,
      "string.empty": `"referralId" cannot be an empty field`,
      "any.required": `"referralId" is a required field`,
    }),
    senderId: Joi.string().required().messages({
      "string.base": `"senderId" should be a type of 'string'`,
      "string.empty": `"senderId" cannot be an empty field`,
      "any.required": `"senderId" is a required field`,
    }),
    action: Joi.string().required().messages({
      "string.base": `"action" should be a type of 'string'`,
      "string.empty": `"action" cannot be an empty field`,
      "any.required": `"action" is a required field`,
    }),
  })
);