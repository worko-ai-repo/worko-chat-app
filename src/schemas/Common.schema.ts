// import the necessary npm packages
import Joi from "joi";

// import the enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

/**
 * commonSchema
 * 
 * Common schema for validating query parameters such as page size, last key, sort order, and search text.
 */
export const commonSchema = Joi.object({
  // Page size validation must be a number and must be at least 1
  pageSize: Joi.number().integer().required().min(1).messages({
    "number.base": "Page size must be a number.",
    "number.integer": "Page size must be an integer.",
    "number.min": "Page size must be at least 1.",
    "any.required": "Page size is required.",
  }),

  /*
  Last key can be falsy value like undefined but if frontend user provide a lastKey then 
  the frontend user must provide a valid lastKey value as string, so in backend 
  we internally decode that valid lastKey value to object[look in request.helper.ts], If the frontend 
  user provide lastKey value as string and it is not valid base64 string then 
  the lastKey value will be undefined again 

  ISSUE:-if lastKey is provided by frontend user and it is  not in base64 format, 
  then it will not decode to original value(possibly object) and lastKey will be "undefined" 
  but we are allowing undefined as lastKey in Common.schema.ts;  
  so, even though if frontend user provide invalid lastKey it won't throw error 
  */
  lastKey: Joi.object().optional().allow(null).messages({
    "object.base": "Provide a valid last key.",
  }),

  // Sort order validation must be a valid value from SortOrderTypeEnum if provided
  sortOrder: Joi.string()
    .optional()
    .valid(...Object.values(SortOrderTypeEnum))
    .messages({
      "any.only": `Invalid sort order. Please provide a valid value from ${Object.values(
        SortOrderTypeEnum
      ).join(", ")}.`,
    }),

  // Search text validation must be a string if provided
  searchText: Joi.string().optional().allow("").messages({
    "string.base": "Search text must be a string.",
  }),
});
