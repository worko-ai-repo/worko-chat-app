// Import Joi library
import Joi from "joi";

/**
 * SendMessageDTOValidation
 * 
 * Joi schema for validating `NewMessageDto` data.
 * 
 * This schema validates the properties of a message to be sent. It ensures that each field is a string and is required. 
 * Custom error messages are provided for each validation rule.
 */
export const SendMessageDTOValidation = Joi.object({
  text: Joi
    .string()
    .required()
    .messages({
        "string.base": `"text" should be a type of 'string'`,
        "string.empty": `"text" cannot be an empty field`,
        "any.required": `"text" is a required field`,
    }),
  referralId: Joi
    .string()
    .required()
    .messages({
        "string.base": `"referralId" should be a type of 'string'`,
        "string.empty": `"referralId" cannot be an empty field`,
        "any.required": `"referralId" is a required field`,
    }),
  senderId: Joi
    .string()
    .required()
    .messages({
        "string.base": `"senderId" should be a type of 'string'`,
        "string.empty": `"senderId" cannot be an empty field`,
        "any.required": `"senderId" is a required field`,
    })  
});
