// load dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// load models
import { ClientModel, DbClientDto } from "../db/models/Client.model";

class ClientDao {
  ModelName = "Client";
  partitionKey = "CLT#";
  sortKey = "ID#{connectionId}";
  GSI1PK = "CLT#USR#";
  GSI1SK = "ID#{userId}";

  async getClientByUserId(userId: string){
    console.log("getClientByUserId in [dao]");
    
    const GSI1SK = this.GSI1SK.replace("{userId}", userId);
    return ClientModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
  }

  /**
   * getClientByConnectionId
   *
   * Retrieves a client from the database based on the provided connection ID.
   *
   * @param {string} connectionId - The ID of the connection associated with the client.
   * @return {Promise<QueryResponse<DbClientDto>>} A promise that resolves to the query response containing the client data.
   */
  async getClientByConnectionId(
    connectionId: string
  ): Promise<QueryResponse<DbClientDto>> {
    console.log("getClientByConnectionId in [dao]");
    return ClientModel.query("PK")
      .eq(this.partitionKey)
      .where("SK")
      .eq(this.sortKey.replace("{connectionId}", connectionId))
      .exec();
  }

  /**
   * deleteClientByConnectionId
   *
   * Deletes a client from the database based on the provided client object.
   *
   * @param {DbClientDto} retrivedClient - The client object to be deleted.
   * @return {Promise<void>} A promise that resolves when the client is successfully deleted.
   */
  async deleteClientByConnectionId(retrivedClient: DbClientDto): Promise<void> {
    console.log("deleteClientByConnectionId in [dao]");
    /*
    Refer Below docs for how to delete Item in dynamodb using dynamoose:-
    https://dynamoosejs.com/guide/Item#itemdeletecallback
    */
    return retrivedClient.delete();
  }

  /**
   * Creates a new client in the database.
   *
   * @param {string} connectionId - The ID of the connection associated with the client.
   * @param {string} userId - The ID of the user associated with the client.
   * @return {Promise<DbClientDto>} A promise that resolves to the newly created client.
   */
  async createClient(
    connectionId: string,
    userId: string
  ): Promise<DbClientDto> {
    console.log("createClient in [dao]");
    return ClientModel.create({
      PK: this.partitionKey,
      SK: this.sortKey.replace("{connectionId}", connectionId),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.replace("{userId}", userId),
      connectionId,
      userId,
    });
  }
}

const clientDaoObj = new ClientDao();
export { ClientDao, clientDaoObj };
