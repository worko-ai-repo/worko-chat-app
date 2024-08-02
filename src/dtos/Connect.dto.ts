import {RouteKey} from "../enums/RouteKey.enum";

export interface ConnectEventDto {
  action: RouteKey.connect;
  userId: string;
}