import { Request, Response, NextFunction } from "express";
import { chatServiceObj } from "../services/Chat.service";
import { ChatMembersDto } from "../dtos/Chat.dto";
import { userServiceObj } from "../services/User.service";

class ChatController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("create in [controller]");
      const members: ChatMembersDto = req.body;
      if (members.senderId === members.receiverId) {
        res.status(400).json({ message: "Sender and receiver cannot be same" });
      }

      // check senderId exists in User table
      const senderIdExists = await userServiceObj.getUserById(members.senderId);
      if (senderIdExists.count === 0) {
        return res.status(400).json({ message: "Sender is not a worko user" });
      }

      // check receiverId exists in User table
      const receiverIdExists = await userServiceObj.getUserById(
        members.receiverId
      );
      if (receiverIdExists.count === 0) {
        return res
          .status(400)
          .json({ message: "Receiver is not a worko user" });
      }

      // check if chat record between these users already created
      const chatExists = await chatServiceObj.getSpecificChatByUserId(
        members.senderId,
        members.receiverId
      );
      if (chatExists.length > 0) {
        return res
          .status(400)
          .json({ message: "Chat record between these users already created" });
      }

      const chat = await chatServiceObj.create(members);
      // console.log(chat,"chat in controller");
      res.status(200).json(chat);
    } catch (error) {
      next(error);
    }
  };

  getChatRecordsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("getChatRecordsByUserId in [controller]");
      const { userId } = req.params;
      const userChats = await chatServiceObj.getChatRecordsByUserId(userId);
      res.status(200).json(userChats);
    } catch (error) {
      next(error);
    }
  };

  getSpecificChatByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("getSpecificChatByUserId in [controller]");
      const { firstId, secondId } = req.params;
      const specificChat = await chatServiceObj.getSpecificChatByUserId(
        firstId,
        secondId
      );
      res.status(200).json(specificChat);
    } catch (error) {
      next(error);
    }
  };
}

export default ChatController;
