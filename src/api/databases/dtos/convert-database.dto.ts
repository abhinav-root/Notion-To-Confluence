import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
export class ConvertDatabaseDto {
  @IsNotEmpty()
  @IsUUID()
  databaseId: string;

  @IsNotEmpty()
  @IsString()
  spaceKey: string;
}
