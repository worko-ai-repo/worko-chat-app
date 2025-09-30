// import express router
import { Router } from "express";

// import controllers
import ChatController from "../controllers/Chat.controller";

// chat router
const ChatRouter = Router();

// create chat controller instance object
const chatControllerObj = new ChatController();

/**
 * @description create chat between two users using "referralId" as "id" attribute of "Chat" table, 
 * chat members as senderId(user id of sender) and receiverId(user id of receiver)
 * 
 * @authorisedRoles ["loggedInUser"]
 */
ChatRouter.post("/create", chatControllerObj.createChatMembers);

// export chat router
export default ChatRouter;