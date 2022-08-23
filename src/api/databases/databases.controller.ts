import { Body, Controller, Post } from '@nestjs/common';
import { ConvertDatabaseDto } from './dtos/convert-database.dto';
import { DatabaseService } from './databases.service';

@Controller('databases')
export class DatabasesController {
  constructor(private readonly databasesService: DatabaseService) {}

  @Post()
  convertNotionDatabaseToConfluence(
    @Body() convertDatabaseDto: ConvertDatabaseDto,
  ) {
    return this.databasesService.convertNotionDatabaseToConfluence(
      convertDatabaseDto,
    );
  }
}
