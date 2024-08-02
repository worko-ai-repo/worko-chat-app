import {RouteKey} from "../enums/RouteKey.enum";

export interface GetMessagesDto {
    chatId: string;
    action: RouteKey.getMessages;
}