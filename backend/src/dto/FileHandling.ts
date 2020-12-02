export interface ProcessDTO {
  name?: string;
  type?: string;
  size: number;
  data: string | ArrayBuffer;
  slice: number;
  recipients: string[];
}
