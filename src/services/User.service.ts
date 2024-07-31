import { userDaoObj } from "../daos/User.dao";
import { LoginUserDto, NewUserDto } from "../dtos/NewUser.dto";

const jwt = require("jsonwebtoken");

class UserService {
  async registerUser(reqBody: NewUserDto) {
    console.log("registerUser in [service]");
    return userDaoObj.registerUser(reqBody);
  }

  async getUserByEmail(email: string) {
    console.log("getUserByEmail in [service]");
    return userDaoObj.getUserByEmail(email);
  }

  async getUserById(id: string) {
    console.log("getUserById in [service]");
    return userDaoObj.getUserById(id);
  }

  async loginUser(reqBody: LoginUserDto) {
    console.log("loginUser in [service]");
    const existingUser = await userDaoObj.getUserByEmail(reqBody.email);
    if (existingUser.count === 0) {
      throw new Error("Email does not exist");
    }

    if (existingUser) {
      const comparePassword =
        reqBody.password === existingUser.toJSON()[0].password;
      if (!comparePassword) {
        throw new Error("Incorrect password");
      } else {
        const payload = {
          email: existingUser.toJSON()[0].email,
          id: existingUser.toJSON()[0].id,
          name: existingUser.toJSON()[0].name,
        };
        const jwtCreatedToken = await jwt.sign(
          payload,
          process.env.SECRET_STRING
        );
        return {
          jwtToken: jwtCreatedToken,
          ...payload,
        };
      }
    }
  }
}

const userServiceObj = new UserService();
export { UserService, userServiceObj };
