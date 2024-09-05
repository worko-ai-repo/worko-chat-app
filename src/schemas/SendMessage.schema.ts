import Joi from "joi";

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
