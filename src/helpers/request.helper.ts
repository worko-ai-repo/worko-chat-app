
// Import dynamoose types
import { ObjectType } from "dynamoose/dist/General";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import DTOs
import {
  RecordListingFilterOptions,
  RecordListingFilterRequestDTO,
} from "../dtos/Common.dto";

// Import enums
import { SortOrderTypeEnum } from "../enums/Common.enum";

// Import helper
import { base64EncodeStrToLastKey } from "./dynamoose.helper";

/**
 * RequestHelper
 *
 * Helper to help with parsing/processing the request payloads.
 */
class RequestHelper {
  /**
   * parseFilterOptions
   *
   * Parses the filter options for a given entity(Company,Subscription,User,Referral.. etc) listing request.
   *
   * It reads the "filterOptions" received from the request and parses it in a way we/backend is expecting it to be.
   *
   * @param {EntityListingFilterRequestDTO} filterOptions - The filter options for the entity listing request.
   * @return {EntityListingFilterOptions} The parsed filter options.
   */
  static parseFilterOptions<
    EntityListingFilterRequestDTO extends RecordListingFilterRequestDTO,
    EntityListingFilterOptions extends RecordListingFilterOptions
  >(filterOptions: EntityListingFilterRequestDTO): EntityListingFilterOptions {
    // pageSize
    let pageSize = parseInt(filterOptions.pageSize as unknown as string);

    // if pageSize is not present in one of PAGE_LENGTH_OPTIONS, then set pageSize to PAGE_LENGTH_DEFAULT
    if (APP_CONSTANTS.PAGE_LENGTH_OPTIONS.indexOf(pageSize) === -1) {
      pageSize = APP_CONSTANTS.PAGE_LENGTH_DEFAULT;
    }

    // lastKey
    let lastKey = undefined;
    if (filterOptions?.lastKey) {
      /*
      Example code snippet to convert object to base64 string:
        const obj = { ac: "h" };
        const jsonString = JSON.stringify(obj);
        const base64String = Buffer.from(jsonString).toString('base64');
        global.logger.info(base64String); // Output: eyJhYyI6ImgifQ==
      
      Note: 
        1.If lastKey is not in base64 format, then "decodedStr" variable will get as undefined 
          then lastKey will be undefined, so response will start from begining by not using lastKey.
        2.If lastKey is in base64 format, then "decodedStr" variable will get as original value(possibly object)
          and values in object are in our expected format like:{ SK: '..', PK: '..' } , 
          then lastKey will be "decodedStr", so response will start from lastKey.
        3.If lastKey is in base64 format, then "decodedStr" variable will get as original value(possibly object)
          but if values in object are not in our expected format like:{ SK: '..', PK: '..' } , 
          then it will throw an error message as below as response:-
          {
            "errorCode": 500,
            "errorMsg": "Exclusive Start Key must have same size as table's key schema",
            "timeStamp": "2024-08-26T11:32:36.547Z"
          }
      */
      let decodedStr: ObjectType | undefined = base64EncodeStrToLastKey(filterOptions.lastKey); // decoding base64 string to original value(possibly object)
      if (decodedStr) {
        lastKey = decodedStr;
      }
    }

    // If sortOrder is undefined, then set sortOrder to descending order by default
    if (!filterOptions?.sortOrder && filterOptions.lastKey !== "undefined") {
      filterOptions.sortOrder = SortOrderTypeEnum.DESCENDING;
    }

    let newFilterOptions: EntityListingFilterOptions = filterOptions as any;
    newFilterOptions = {
      ...newFilterOptions,
      ...{
        pageSize: pageSize,
        lastKey: lastKey,
      },
    };
    return newFilterOptions;
  }
}

// Export RequestHelper
export { RequestHelper };