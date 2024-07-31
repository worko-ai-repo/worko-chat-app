import { Router } from "express";

import ChatRouter from "./routes/Chat.route";
import MessageRouter from "./routes/Message.route";
import UserRouter from "./routes/User.route";

const router = Router();

router.use("/user", UserRouter);

router.use("/chat", ChatRouter);

router.use("/message", MessageRouter);

export default router;
