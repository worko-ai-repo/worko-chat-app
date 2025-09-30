// import Request, Response and NextFunction from express
import { Request, Response, NextFunction } from "express";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import dtos
import { ChatMembersDto } from "../dtos/Chat.dto";

// Import models
import { DbChatDto } from "../db/models/Chat.model";

// import services
import { chatServiceObj } from "../services/Chat.service";

// import schemas
import { ChatMembersDTOValidation } from "../schemas/Chat.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

/**
 * ChatController
 * 
 * chat controller class with chat related methods like creating new chat between two users, 
 * deleting chat between two users etc..
 */
class ChatController {
  /**
   * createChatMembers
   *
   * Creates a new chat members.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @param {NextFunction} next - The next middleware function.
   * @throws {RequestValidationError} - If the request body is invalid.
   * @throws {BaseError} - If a chat between the specified users already exists.
   */
  createChatMembers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info("create chat members [Controller]", {
        methodName: this.createChatMembers.name,
      });

      // retrieve members from request body
      const reqBody: ChatMembersDto = req.body;

      // Validate the incoming chat members and throw an error if it's invalid
      const { error, value: validatedReqBody } = ChatMembersDTOValidation.validate(
        reqBody,
        {
          abortEarly: false,
        }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      // check if chat members record between these users already created and throw error if yes
      const getChatMembers: QueryResponse<DbChatDto> = await chatServiceObj.getChatMembersById(
        validatedReqBody.referralId
      );
      if (getChatMembers.count) {
        throw new BaseError("Chat between these users already exists.", HttpStatusCode.BAD_REQUEST_400);
      }

      // create new chat members record
      const chatMembers: DbChatDto = await chatServiceObj.createChatMembers(validatedReqBody);

      // return created chat record
      return res.status(HttpStatusCode.CREATED_201).json(chatMembers);
    } catch (error) {
      // catch error and pass it to next middleware
      next(error);
    }
  };
}

// export chat controller class
export default ChatController;