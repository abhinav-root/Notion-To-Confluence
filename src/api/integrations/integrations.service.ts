import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { NOTION_CLIENT } from 'src/contants';

@Injectable()
export class IntegrationsService {
  constructor(@Inject(NOTION_CLIENT) private readonly notion: Client) {}

  getAllIntegrations() {
    return this.notion.search({});
  }
}
