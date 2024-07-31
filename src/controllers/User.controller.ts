import { Request, Response, NextFunction } from "express";
import { userServiceObj } from "../services/User.service";
import { LoginUserDto, NewUserDto } from "../dtos/NewUser.dto";
import { userDaoObj } from "../daos/User.dao";

class UserController {
  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("registerUser in [controller]");
      const reqBody: NewUserDto = req.body;

      const emailExists = await userDaoObj.getUserByEmail(reqBody.email);

      if (emailExists.count > 0) {
        return res.status(400).json({"message":"Email already exists"});
      }

      const newRegisteredUser = await userServiceObj.registerUser(reqBody);
      res.status(201).json(newRegisteredUser);
    } catch (error) {
      next(error);
    }
  };

  getUserByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("getUserByEmail in [controller]");
      const { email } = req.params;
      const userDetailByEmail = await userServiceObj.getUserByEmail(email);
      if (userDetailByEmail.count === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(userDetailByEmail);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("getUserById in [controller]");
      const { id } = req.params;
      const userDetailById = await userServiceObj.getUserById(id);
      if (userDetailById.count === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(userDetailById);
    } catch (error) {
      next(error);
    }
  };

  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("loginUser in [controller]");
      const reqBody: LoginUserDto = req.body;
      const user = await userServiceObj.loginUser(reqBody);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
