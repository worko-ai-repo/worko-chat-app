// load daos
import { clientDaoObj } from "../daos/Client.dao";

// load models
import { DbClientDto } from "../db/models/Client.model";

const Disconnect = async (connectionId: string) => {

  console.log("connectionId in Disconnect:", connectionId);

  // check if the client exists by getting the client by connectionId
  const getClientByConnectionId = await clientDaoObj.getClientByConnectionId(
    connectionId
  );
  console.log(
    "getClientByConnectionId in Disconnect function",
    getClientByConnectionId
  );

  const retrivedClient: DbClientDto = getClientByConnectionId[0];
  console.log(
    "retrivedClient in Disconnect function:",retrivedClient
  );

  // delete the client
  await clientDaoObj.deleteClient(retrivedClient);

  return {
    statusCode: 200,
    body: "",
  };
};

// export Disconnect function
export default Disconnect;