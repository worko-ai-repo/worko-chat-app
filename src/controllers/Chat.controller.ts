// import Request, Response and NextFunction from express
import { Request, Response, NextFunction } from "express";

// import dtos
import { ChatMembersDto } from "../dtos/Chat.dto";

// import services
import { chatServiceObj } from "../services/Chat.service";

// import schemas
import { ChatMembersDTOValidation } from "../schemas/Chat.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

// chat controller class with chat related methods like creating new chat between two users, deleting chat between two users etc..
class ChatController {
  /**
   * create
   *
   * Creates a new chat members.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @param {NextFunction} next - The next middleware function.
   * @throws {RequestValidationError} - If the request body is invalid.
   * @throws {BaseError} - If a chat between the specified users already exists.
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("create in [controller]");

      // retrieve members from request body
      const members: ChatMembersDto = req.body;
      console.log("members in create [controller]:-", members);

      // Validate the incoming chat members and throw an error if it's invalid
      const { error, value: membersData } = ChatMembersDTOValidation.validate(
        members,
        {
          abortEarly: false,
        }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      // check if chat members record between these users already created and throw error if yes
      const getChatMembers = await chatServiceObj.getChatMembersById(membersData.referralId);
      console.log("getChatMembers in create [controller]:-", getChatMembers);

      console.log("getChatMembers.count in create [controller]:-",getChatMembers.count);
      if (getChatMembers.count) {
        throw new BaseError("Chat between these users already exists.");
      }

      // create new chat members record
      const chatMembers = await chatServiceObj.create(membersData);

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