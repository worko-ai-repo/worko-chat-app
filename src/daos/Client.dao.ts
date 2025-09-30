// load dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// load models
import { ClientModel, DbClientDto } from "../db/models/Client.model";

// client dao class that implements the CRUD operations for clients
class ClientDao {
  modelName = "Client";
  partitionKey = "CHAT#ID#{chatId}";
  sortKey = "CONN#ID#{connectionId}";

  GSI1PK = "CONN#ID#";
  GSI1SK = "ID#{connectionId}";

  /**
   * createClient
   *
   * Creates a new client record in the database.
   *
   * @param {string} connectionId - The connection ID of the client.
   * @param {string} userId - The user ID of the client.
   * @param {string} referralId - The referral ID
   * @return {Promise<DbClientDto>} A promise that resolves to the newly created client model.
   */
  async createClient(
    connectionId: string,
    userId: string,
    referralId: string
  ): Promise<DbClientDto> {
    global.logger.info("createClient in [dao]");

    // create a new client
    return ClientModel.create({
      PK: this.partitionKey.strtr({"{chatId}": referralId}),
      SK: this.sortKey.strtr({"{connectionId}": connectionId}),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({"{connectionId}": connectionId}),
      connectionId,
      userId,
    });
  }

  /**
   * getClient
   *
   * Retrieves a client record from the database based on the provided connection ID and referral ID.
   *
   * @param {string} connectionId - The connection ID of the client.
   * @param {string} referralId - The referral ID
   * @return {Promise<QueryResponse<DbClientDto>>} A promise that resolves to the client record.
   */
  async getClient(
    connectionId: string,
    referralId: string
  ): Promise<QueryResponse<DbClientDto>> {
    global.logger.info("getClient in [dao]");

    return ClientModel.query("PK")
      .eq(this.partitionKey.strtr({"{chatId}": referralId}))
      .where("SK")
      .eq(this.sortKey.strtr({"{connectionId}": connectionId}))
      .exec();
  }

  /**
   * deleteClient
   *
   * Deletes a client from the database based on the provided client object.
   *
   * @param {DbClientDto} retrivedClient - The client object to be deleted.
   */
  async deleteClient(retrivedClient: DbClientDto) {
    global.logger.info("deleteClient in [dao]");

    /**
    * Refer Below docs for how to delete Item in dynamodb using dynamoose:-
    * @see https://dynamoosejs.com/guide/Item#itemdeletecallback
    */
    return retrivedClient.delete();
  }

  /**
   * getAllConnectionsByChatId
   *
   * Retrieves all client connections from the database based on the provided referral ID.
   *
   * @param {string} referralId - The referral ID .
   * @return {Promise<QueryResponse<DbClientDto>>} A promise that resolves to the query response containing all client connections.
   */
  async getAllConnectionsByChatId(
    referralId: string
  ): Promise<QueryResponse<DbClientDto>> {
    global.logger.info("getAllConnections in [dao]");

    return ClientModel.query("PK")
      .eq(this.partitionKey.strtr({"{chatId}": referralId}))
      .where("SK")
      .beginsWith("CONN#ID#")
      .exec();
  }

  /**
   * getClientByConnectionId
   *
   * Retrieves a client record from the database based on the provided connection ID.
   *
   * @param {string} connectionId - The connection ID of the client.
   * @return {Promise<QueryResponse<DbClientDto>>} A promise that resolves to the query response containing the client record.
   */
  async getClientByConnectionId(
    connectionId: string
  ): Promise<QueryResponse<DbClientDto>> {
    global.logger.info("getClientByConnectionId in [dao]");

    return ClientModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(this.GSI1SK.strtr({"{connectionId}": connectionId}))
      .exec();
  }
}

// create client dao object
const clientDaoObj = new ClientDao();

// export client dao instance object and class
export { ClientDao, clientDaoObj };