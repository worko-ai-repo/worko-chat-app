// import DTOs
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "./Common.dto";

// import enums
import { RouteKeyAction } from "../enums/RouteKeyAction.enum";

/**
 * GetMessagesListingFilterOptions
 *
 * It is similar to "GetMessagesListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface GetMessagesListingFilterOptions extends RecordListingFilterOptions {
  // Represents the filter options for querying get messages.
  // Should be used when filtering get messages records.
  action: RouteKeyAction.getMessages;
  referralId: string;
  senderId: string;
}

/**
 * GetMessagesListingFilterRequestDTO
 */
export interface GetMessagesListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  // Represents the filter request DTO for querying get messages.
  // Should be used when requesting to filter get messages records.
  action: RouteKeyAction.getMessages;
  referralId: string;
  senderId: string;
}