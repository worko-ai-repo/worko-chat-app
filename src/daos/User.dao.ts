import { ulid } from "ulid";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { NewUserDto } from "../dtos/NewUser.dto";
import { DbUserDto, UserModel } from "../db/models/User.model";

class UserDao {
  ModelName = "User";
  partitionKey = "USR#EML#{email}";
  sortKey = "ID#{id}";
  GSI1PK = "USR#";
  GSI1SK = "ID#{id}";

  async registerUser(reqBody: NewUserDto): Promise<DbUserDto> {
    console.log("registerUser in [dao]");

    const id = ulid();
    const PK = this.partitionKey.replace("{email}", reqBody.email);
    const SK = this.sortKey.replace("{id}", id);
    const name = reqBody.name;
    const email = reqBody.email;
    const password = reqBody.password;
    const GSI1PK = this.GSI1PK;
    const GSI1SK = this.GSI1SK.replace("{id}", id);

    return UserModel.create({
      PK,
      SK,
      GSI1PK,
      GSI1SK,
      id,
      name,
      email,
      password,
    });
  }

  async getUserById(id: string): Promise<QueryResponse<DbUserDto>> {
    console.log("getUserById in [dao]");
    const GSI1SK = this.GSI1SK.replace("{id}", id);
    return UserModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
  }

  async getUserByEmail(email: string): Promise<QueryResponse<DbUserDto>> {
    console.log("getUserByEmail in [dao]");

    return UserModel.query("PK")
      .eq(this.partitionKey.replace("{email}", email))
      .where("SK")
      .beginsWith("ID#")
      .exec();
  }
}

const userDaoObj = new UserDao();
export { UserDao, userDaoObj };
