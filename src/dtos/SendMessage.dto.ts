/**
 * NewMessageDto
 *
 * Represents the structure of a new message being sent in the chat system.
 * This DTO (Data Transfer Object) contains the essential details needed for
 * creating a new message.
 *
 */
export interface NewMessageDto {
  referralId: string;
  senderId: string;
  text: string;
}