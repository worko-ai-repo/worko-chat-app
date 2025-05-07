
/**
 *
 * Constants related to the 'worko' database table, including table name, primary key and sort key definitions,
 * schema options, and table options for the worko model.
 *
 */
const DB_CONSTANTS = {
  WORKO_PK_SK: {
    // Defines the primary key (PK) and sort key (SK) for the 'worko' table
    PK: { type: String, hashKey: true },
    SK: { type: String, rangeKey: true },
  },
  WORKO_MODEL_SCHEMA_OPTIONS: {
    // Schema options for the 'worko' model
    create: false,
    waitForActive: false,

    // @todo this should be false, because we should know what we are creating in the database.
    // When there is unknown field is being added then the dynamoose should through error.
    saveUnknown: true,

    timestamps: true,
  },
  WORKO_MODEL_TABLE_OPTIONS: {
    // Specify the table name explicitly
    tableName: process.env.APP_AWS_DYNAMODB_TABLE_NAME,
  },
};

global.logger.info(
  "APP_AWS_DYNAMODB_TABLE_NAME in DB.constants.ts",
  process.env.APP_AWS_DYNAMODB_TABLE_NAME
);

export default DB_CONSTANTS
