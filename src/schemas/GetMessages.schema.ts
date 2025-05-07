// import Joi library
import Joi from "joi";

// import common schema
import { commonSchema } from "./Common.schema";

// create get messages schema
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
    })
  })
);