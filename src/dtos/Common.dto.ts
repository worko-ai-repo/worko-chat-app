// Import the npm packages
import { ObjectType } from "dynamoose/dist/General";

import { SortOrderTypeEnum } from "../enums/Common.enum";

/**
 * RecordListingFilterOptions
 *
 * It is similar to "RecordListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface RecordListingFilterOptions {
  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: number;

  /**
   * lastKey (offset)
   *
   * The "lastKey" property value returned by the "Dynamoose" in the previous "query" response.
   *
   * This will become the parameter for the "startAt" method of Dynamoose in the next query.
   *
   * Sample Value: { SK: 'ID#01HHM4Q0DDH1A5S56HJQ71P82V', PK: 'COMP#' }
   */
  lastKey?: ObjectType;

  // sortOrder means the order in which the records should be sorted. posible values: "ascending" or "descending"
  sortOrder?: SortOrderTypeEnum;

  // search text
  searchText?: string;
}

/**
 * RecordListingFilterRequestDTO
 *
 * The possible data expected in the request payload if API wants to filter the data.
 */
export interface RecordListingFilterRequestDTO {
  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: number;

  /**
   * lastKey (offset)
   *
   * The "lastKey" property value returned by the "Dynamoose" in the previous "query" response.
   *
   * This will become the parameter for the "startAt" method of Dynamoose in the next query.
   *
   * The "lastKey" property from Dynamoose: { SK: 'ID#01HHM4Q0DDH1A5S56HJQ71P82V', PK: 'COMP#' }
   * Sample Value: eyBTSzogJ0lEIzAxSEhNNFEwRERIMUE1UzU2SEpRNzFQODJWJywgUEs6ICdDT01QIycgfQ==
   */
  lastKey?: string;

  // sortOrder means the order in which the records should be sorted. posible values: "ascending" or "descending"
  sortOrder?: SortOrderTypeEnum;

  // search text
  searchText?: string;
}

/**
 * RecordListingPaginationResponseDTO
 *
 * The representation of the pagination details that would be passed to the API consumer.
 */
export interface RecordListingPaginationResponseDTO {
  // The number of records returned back in the API response.
  count: number;

  // If filter is applied then the filtered record count from the all records. Otherwise it would be undefined.
  queriedCount?: number;

  /**
   * pageSize (limit)
   *
   * The maximum number of records that should be returned in the API response.
   */
  pageSize: number;

  /**
   * lastKey (offset)
   *
   * The "lastKey" property value returned by the "Dynamoose" in the "query" response.
   *
   * This will become the parameter for the "startAt" method of Dynamoose in the next query.
   *
   * "lastKey" from Dynamoose: { SK: 'ID#01HHM4Q0DDH1A5S56HJQ71P82V', PK: 'COMP#' }
   * Sample Value: eyBTSzogJ0lEIzAxSEhNNFEwRERIMUE1UzU2SEpRNzFQODJWJywgUEs6ICdDT01QIycgfQ==
   */
  lastKey?: string;

  // sortOrder means the order in which the records should be sorted. posible values: "ascending" or "descending"
  sortOrder?: SortOrderTypeEnum;
}

/**
 * RecordListingResponseDTO
 *
 * The main response would be retruend back in the API response. It would include the pagination details and records.
 */
export interface RecordListingResponseDTO {
  data: any[];
  pagination: RecordListingPaginationResponseDTO;
  eventName?: string;
}

/**
 * RequestLocalContextDto
 *
 * This `RequestLocalContextDto` object  can be accessed globally in the application.
 * This was set from the authorizer context i.e. from `authorizer-context.middleware.ts`,
 * This would be used in the backend to perform api security.
 */
export interface RequestLocalContextDto {
  userId: string;
  userEmail: string;
  cognitoUserGroups: string[];
}