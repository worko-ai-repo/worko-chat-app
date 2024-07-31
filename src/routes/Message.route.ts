
import { Router } from "express";
import MessageController from "../controllers/Message.controller";


const MessageRouter = Router();

const messageControllerObj = new MessageController();

// create new message.
MessageRouter.post("/addMessage", messageControllerObj.addMessage); 

// get messages by chatId
MessageRouter.get("/:chatId", messageControllerObj.getMessagesByChatId);

export default MessageRouter;