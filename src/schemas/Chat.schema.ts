// import Joi library
import Joi from "joi";

// create chat members schema
export const ChatMembersDTOValidation = Joi.object({
  referralId: Joi.string().required().messages({
    "string.base": "referralId must be a string",
    "any.required": "referralId is a required field",
  }),
  userIdOne: Joi.string().required().messages({
    "string.base": "userIdOne must be a string",
    "any.required": "userIdOne is a required field",
  }),
  userIdTwo: Joi.string().required().messages({
    "string.base": "userIdTwo must be a string",
    "any.required": "userIdTwo is a required field",
  }),
});