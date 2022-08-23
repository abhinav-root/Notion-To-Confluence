import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotionModule } from './api/notion/notion.module';
import { PagesModule } from './api/pages/pages.module';
import { IntegrationsModule } from './api/integrations/integrations.module';
import { DatabasesModule } from './api/databases/databases.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotionModule.forRoot(process.env.NOTION_ACCESS_TOKEN),
    PagesModule,
    IntegrationsModule,
    DatabasesModule,
  ],
})
export class AppModule {}
