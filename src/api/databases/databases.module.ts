import { Module } from '@nestjs/common';
import { PagesModule } from '../pages/pages.module';
import { DatabasesController } from './databases.controller';
import { DatabaseService } from './databases.service';

@Module({
  controllers: [DatabasesController],
  providers: [DatabaseService],
  imports: [PagesModule],
})
export class DatabasesModule {}
