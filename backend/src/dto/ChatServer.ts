import { RefactorActionInfo } from "typescript";

export interface SendMessageDTO {
  recipients: string[];
  text: string;
}

export interface RecieveMessageDTO {
  recipients: string[];
  text: string;
  sender: string;
}

export interface RecieveFileDTO {
  recipients: string[];
  data: ArrayBuffer | string;
  sender: string;
}
