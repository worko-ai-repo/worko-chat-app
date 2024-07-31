import { Router } from "express";
import ChatController from "../controllers/Chat.controller";

const ChatRouter = Router();

const chatControllerObj = new ChatController();

// create chat between two users
ChatRouter.post("/create", chatControllerObj.create);

// get all the chat records of specific user(list of all with whom particular employee/candidate chatting )
ChatRouter.get("/:userId", chatControllerObj.getChatRecordsByUserId);

// get specific chat between two users gives chatid
ChatRouter.get("/find/:firstId/:secondId", chatControllerObj.getSpecificChatByUserId);

export default ChatRouter;