// import Joi library
import Joi from "joi";

/**
 * ChatMembersDTOValidation
 * 
 * Joi schema for validating `ChatMembersDto` objects.
 * 
 * This schema ensures that the `ChatMembersDto` interface properties adhere to the required data types and presence rules.
 * 
 * Custom error messages are provided for type errors and missing required fields.
 */
export const ChatMembersDTOValidation = Joi.object({
  referralId: Joi.string().required().messages({
    "string.base": "The referral Id field must be a string.",
    "any.required": "The referral Id field is a required field.",
  }),
  userIdOne: Joi.string().required().messages({
    "string.base": "The userIdOne field must be a string.",
    "any.required": "The userIdOne field is required.",
  }),
  userIdTwo: Joi.string().required().messages({
    "string.base": "The userIdTwo field must be a string.",
    "any.required": "The userIdTwo field is a required.",
  }),
});