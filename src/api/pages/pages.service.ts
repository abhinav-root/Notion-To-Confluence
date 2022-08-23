import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { APIErrorCode, Client } from '@notionhq/client';
import {
  GetBlockResponse,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { NOTION_CLIENT } from 'src/contants';
import { ConvertPageDto } from './dtos/convert-page.dto';
import { BlockType } from './enums/block-type.enum';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PagesService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTION_CLIENT) private readonly notion: Client,
  ) {}

  async convertNotionPageToConfluence({ pageId, spaceKey }: ConvertPageDto) {
    try {
      const page: any = await this.getBlock(pageId);
      console.log(page);
      const pageTitle: string = page.child_page.title;
      const pageChildren = await this.getBlockChildren(pageId);
      const content = await this.createPageContent(pageChildren);
      const result = await this.createConfluencePage(
        spaceKey,
        pageTitle,
        content,
      );
      return result;
    } catch (err) {
      console.log(err);
      if (err.code === APIErrorCode.ObjectNotFound) {
        const errorBody = JSON.parse(err.body);
        throw new NotFoundException(errorBody.message);
      } else if (err?.response?.data?.statusCode === 403) {
        throw new ForbiddenException('Invalid space key');
      } else if (err?.response?.data?.statusCode === 400) {
        throw new BadRequestException(err.response.data.message);
      }
    }
  }

  getBlockChildren(blockId: string): Promise<ListBlockChildrenResponse> {
    return this.notion.blocks.children.list({ block_id: blockId });
  }

  getBlock(blockId: string): Promise<GetBlockResponse> {
    return this.notion.blocks.retrieve({ block_id: blockId });
  }

  async createPageContent(pageContent): Promise<string> {
    const results = pageContent.results;
    let content = '';
    for (const [index, object] of results.entries()) {
      if (object.type === BlockType.BULLETED_LIST_ITEM) {
        const val = object?.bulleted_list_item?.rich_text[0]?.text.content;
        if (this.isFirstOfType(index, results, BlockType.BULLETED_LIST_ITEM)) {
          content += '<ul>';
        }
        content += `<li>${val}</li>`;
        if (this.isLastOfType(index, results, BlockType.BULLETED_LIST_ITEM)) {
          content += '</ul>';
        }
      } else if (object.type === BlockType.NUMBERED_LIST_ITEM) {
        const val = object?.numbered_list_item?.rich_text[0]?.text.content;

        if (this.isFirstOfType(index, results, 'numbered_list_item')) {
          content += '<ol>';
        }
        content += `<li>${val}</li>`;
        if (this.isLastOfType(index, results, 'numbered_list_item')) {
          content += '</ol>';
        }
      } else if (object.type === BlockType.PARAGRAPH) {
        const val = object?.paragraph?.rich_text[0]?.text.content;
        if (val) {
          content += `<p>${val}</p>`;
        }
      } else if (object.type === BlockType.HEADING_1) {
        const val = object?.heading_1?.rich_text[0]?.text.content;
        content += `<h1>${val}</h1>`;
      } else if (object.type === BlockType.HEADING_2) {
        const val = object?.heading_2?.rich_text[0]?.text.content;
        content += `<h2>${val}</h2>`;
      } else if (object.type === BlockType.HEADING_3) {
        const val = object?.heading_3?.rich_text[0]?.text.content;
        content += `<h3>${val}</h3>`;
      } else if (object.type == BlockType.TABLE) {
        let hasColumnHeader = object.table.has_column_header;

        const tableContent = await this.getBlockChildren(object.id);
        const rows: any = tableContent.results;
        let tbody = '<tbody>';
        let rowContent = '';
        for (const row of rows) {
          if (hasColumnHeader) {
            rowContent += '<tr>';
            for (const cell of row.table_row.cells) {
              const textContent = cell[0].plain_text;
              rowContent += `<th><p><strong>${textContent}</strong></p></th>`;
            }
            rowContent += '</tr>';
            hasColumnHeader = false;
          } else {
            rowContent += '<tr>';
            for (const cell of row.table_row.cells) {
              const textContent = cell[0].plain_text;
              rowContent += `<td><p>${textContent}</p></td>`;
            }
            rowContent += '</tr>';
          }
        }
        tbody += rowContent + '</tbody>';
        const table = `<table>${tbody}</table>`;
        content += table;
      }
    }
    return content;
  }

  isFirstOfType(index, results, type) {
    return index == 0 || results[index - 1].type != type;
  }
  isLastOfType(index, results, type) {
    return index == results.length - 1 || results[index + 1].type != type;
  }

  async createConfluencePage(spaceKey: string, title: string, content: string) {
    const domain = this.configService.get<string>('ATLASSIAN_DOMAIN');
    const apiToken = this.configService.get<string>('ATLASSIAN_API_TOKEN');

    const result = await axios.post(
      `${domain}/wiki/rest/api/content`,
      {
        space: {
          key: spaceKey,
        },
        type: 'page',
        title,
        body: {
          storage: {
            representation: 'storage',
            value: content,
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${apiToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    return result.data;
  }
}
