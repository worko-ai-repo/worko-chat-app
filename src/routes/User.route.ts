import { Router } from "express";
import UserController from "../controllers/User.controller";

const UserRouter = Router();

const userControllerObj = new UserController();

UserRouter.post("/register", userControllerObj.registerUser);

UserRouter.get("/:email", userControllerObj.getUserByEmail);

UserRouter.get("/userId/:id", userControllerObj.getUserById);

UserRouter.post("/login", userControllerObj.loginUser);

export default UserRouter;
