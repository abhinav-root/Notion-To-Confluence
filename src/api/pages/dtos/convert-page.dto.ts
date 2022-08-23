import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ConvertPageDto {
  @IsNotEmpty()
  @IsUUID()
  pageId: string;

  @IsNotEmpty()
  @IsString()
  spaceKey: string;
}
