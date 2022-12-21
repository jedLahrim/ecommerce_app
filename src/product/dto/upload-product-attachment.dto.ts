import { IsString } from 'class-validator';

export class UploadProductAttachmentDto {
  @IsString()
  attchment: string;
}
