/**
 * ChatMembersDto
 *
 * This interface defines the structure for chat member data, 
 * including the `referralId`, `userIdOne`, and `userIdTwo`.
 * 
 * Used for creating chat between two users.
 * 
 * @todo: As of now chat feature is being used only at `referral`, so we named
 * the `id` attribute of `Chat` table as `referralId` while passing in the payload. But in future if we want to
 * use chat feature at other places, we should change the name of the `referralId` in `payload` to `chatId` for
 * readability.
 * 
 * @property {string} referralId - The unique identifier for the chat, used as the `id` attribute for the Chat table.
 * @property {string} userIdOne - The unique identifier of the first user participating in the chat.
 * @property {string} userIdTwo - The unique identifier of the second user participating in the chat.
 */
export interface ChatMembersDto {
  referralId: string; 
  userIdOne: string;
  userIdTwo: string;
}
