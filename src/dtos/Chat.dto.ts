
// request body for creating new chat between two users
export interface ChatMembersDto {
  referralId: string; // using referralId as id attribute for Chat table
  userIdOne: string; 
  userIdTwo: string; 
}