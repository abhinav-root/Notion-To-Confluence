import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { NOTION_CLIENT } from 'src/contants';

@Module({})
export class NotionModule {
  static forRoot(notionKey: string): DynamicModule {
    const notion = new Client({ auth: notionKey });
    const notionProvider: Provider = {
      provide: NOTION_CLIENT,
      useValue: notion,
    };
    return {
      module: NotionModule,
      providers: [notionProvider],
      exports: [notionProvider],
      global: true,
    };
  }
}
