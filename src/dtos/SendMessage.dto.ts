import { RouteKeyAction } from "../enums/RouteKeyAction.enum";

export interface NewMessageDto {
  action: RouteKeyAction.sendMessage;
  referralId: string;
  senderId: string;
  text: string;
}