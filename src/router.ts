// import express router
import { Router } from "express";

// import routes
import ChatRouter from "./routes/Chat.route";

// create router
const router = Router();

// chat router
router.use("/chat", ChatRouter);

// export router
export default router;