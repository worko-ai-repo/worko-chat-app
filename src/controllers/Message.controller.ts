import { Request, Response, NextFunction } from "express";
import { messageServiceObj } from "../services/Message.service";
import { NewMessageDto } from "../dtos/NewMessage.dto";


class MessageController {
  addMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("addMessage in [controller]");
      const newMessageBody: NewMessageDto = req.body;
      const newMessage = await messageServiceObj.addMessage(newMessageBody);
      res.status(200).json(newMessage);
    } catch (error) {
      next(error);
    }
  };

  getMessagesByChatId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("getMessagesByChatId in [controller]");
      const { chatId } = req.params;
      const messages = await messageServiceObj.getMessagesByChatId(chatId);
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  };
}

export default MessageController;