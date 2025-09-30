// import Joi library
import Joi from "joi";

// create connect schema with Joi
export const ConnectDTOValidation = Joi.object({
  userId: Joi
    .string()
    .required()
    .messages({
        "string.base": `"userId" should be a type of 'string'`,
        "string.empty": `"userId" cannot be an empty field`,
        "any.required": `"userId" is a required field`,
    }),
  referralId: Joi
    .string()
    .required()
    .messages({
        "string.base": `"referralId" should be a type of 'string'`,
        "string.empty": `"referralId" cannot be an empty field`,
        "any.required": `"referralId" is a required field`,
    }), 
    /*
    Authorization field is optional in the schema because in the "prod" or "dev" environment, 
    the API gateway will pass the token as query string parameter in the Authorization variable but in the
    local environment, it will not be passed.
    */
    Authorization: Joi
    .string()
    .optional()
    .messages({
        "string.base": `"Authorization" should be a type of 'string'`,
    })
});
