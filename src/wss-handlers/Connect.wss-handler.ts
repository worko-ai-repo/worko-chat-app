// load aws related modules and types
import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda";

// load daos
import { clientDaoObj } from "../daos/Client.dao";

// load schemas
import { ConnectDTOValidation } from "../schemas/Connect.schema";

// load utils
import { RequestValidationError } from "../utils/errors.util";

const Connect = async (
  connectionId: string,
  connectionQueryParameters: APIGatewayProxyEventQueryStringParameters | null
) => {
  console.log("connectionId in Connect:", connectionId);
  console.log("connectionQueryParameters in Connect:",connectionQueryParameters);

  // Validate the incoming connection query parameters and throw an error if it's invalid
  const { error, value: connectionQueryStrParameters } =
    ConnectDTOValidation.validate(connectionQueryParameters, {
      abortEarly: false,
    }
  );
  if (error) {
    throw new RequestValidationError(error);
  }

  console.log("connectionQueryStrParameters in Connect:", connectionQueryStrParameters);

  // get userId from connectionQueryStrParameters
  const userId = connectionQueryStrParameters["userId"] as string;
  console.log("userId in Connect:", userId);

  // get referralId from connectionQueryStrParameters
  const referralId = connectionQueryStrParameters["referralId"] as string;
  console.log("referralId in Connect:", referralId);

  // create a new client
  await clientDaoObj.createClient(connectionId, userId, referralId);

  return {
    statusCode: 200,
    body: "",
  };
};

// export Connect function
export default Connect;