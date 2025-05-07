/**
 * SortOrderTypeEnum
 * 
 * Enumeration representing the sort order types.
 *
 * This enum defines the possible sorting orders for a collection of items.
 * - `ASCENDING` indicates sorting in ascending order (e.g., 1, 2, 3).
 * - `DESCENDING` indicates sorting in descending order (e.g., 3, 2, 1).
 * 
 */
export enum SortOrderTypeEnum {
  /**
   * Sort in ascending order. For example: 1, 2, 3.
   */
  ASCENDING = "ascending",
  /**
   * Sort in descending order. For example: 3, 2, 1.
   */
  DESCENDING = "descending",
}

/**
 * RouteKeyActionEnum
 * 
 * Enumeration representing WebSocket route key actions.
 * 
 * This enum defines the possible route actions for a WebSocket API.
 * - `$connect` represents the connection action when a client connects.
 * - `$disconnect` represents the disconnection action when a client disconnects.
 * - `sendMessage` represents the action to send a message.
 * - `getMessages` represents the action to retrieve messages.
 * - `$default` represents the default route action for undefined routes.
 * 
 * @todo: 
 *  1. As per naming conventions we are using for `enums` the property name
 *        should be in `UpperCase`, need to update it in near future.
 *  2. Need to think in which file we should use this `enum`
 */
export enum RouteKeyActionEnum {
  connect = "$connect",
  disconnect = "$disconnect",
  sendMessage = "sendMessage",
  getMessages = "getMessages",
  default = "$default",
}
