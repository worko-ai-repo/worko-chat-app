// Import npm packages
import { ObjectType } from "dynamoose/dist/General";

/**
 * lastKeyToBase64EncodeStr
 *
 * Encode the provided "object" into "Base64Encoded" string
 *
 * @param {ObjectType} object [OPTIONAL]
 * @returns {undefined | string}
 */
export function lastKeyToBase64EncodeStr(
  object?: ObjectType
): undefined | string {
  // If the provided value is null, undefined, etc
  if (!object) {
    return undefined;
  }

  return Buffer.from(JSON.stringify(object)).toString("base64");
}

/**
 * base64EncodeStrToLastKey
 *
 * Decode the provided Base64Encoded string and pass it back.
 *
 * @param {string} str [OPTIONAL]
 * @returns {undefined | any}
 */
export function base64EncodeStrToLastKey(str?: string): undefined | ObjectType {
  try {
    // If the provided value is null, undefined, etc
    if (!str) {
      return undefined;
    }

    return JSON.parse(Buffer.from(str, "base64").toString("utf-8"));
  } catch (error: any) {
    // Logger message
    console.error("Unable to perform Base64Decode.", {
      filePath: __filename,
      methodName: "base64EncodeStrToLastKey",
      str: str,
      message: error.message,
    });
    return undefined;
  }
}