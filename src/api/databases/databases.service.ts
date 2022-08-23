import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@notionhq/client';
import { NOTION_CLIENT } from 'src/contants';
import { PagesService } from '../pages/pages.service';
import { ConvertDatabaseDto } from './dtos/convert-database.dto';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTION_CLIENT) private readonly notion: Client,
    private readonly pagesService: PagesService,
  ) {}
  async convertNotionDatabaseToConfluence({
    databaseId,
    spaceKey,
  }: ConvertDatabaseDto) {
    const database: any = await this.notion.databases.retrieve({
      database_id: databaseId,
    });

    let content = '<table><tbody>';
    const tableTitle = database.title[0].text.content;
    const properties = database.properties;
    const tableHeadings = this.createTableHeadings(properties);
    content += '<tr>' + tableHeadings + '</tr>';

    const databaseDetails: any = await this.notion.databases.query({
      database_id: databaseId,
    });

    // return databaseDetails;

    const pages = databaseDetails.results;

    for (const page of pages) {
      const pageId = page.id;
      let rowContent = '';
      for (const [key, value] of Object.entries(page.properties)) {
        const propertyId = (value as any).id;
        const rowData = await this.notion.pages.properties.retrieve({
          page_id: pageId,
          property_id: propertyId,
        });
        if (rowData.type === 'checkbox') {
          const isChecked = rowData.checkbox;
          rowContent += `<td><p>${
            isChecked ? 'CHECKED' : 'UNCHECKED'
          }</p></td>`;
        } else if (rowData.type === 'select') {
          const value = rowData.select.name;
          const color = rowData.select.color;
          rowContent += `<td><span style="color: '${color}'">${value}</span></td>`;
        } else if (rowData.type === 'multi_select') {
          rowContent += '<td>';
          for (const data of rowData.multi_select) {
            const color = data.color;
            rowContent += `<p><span style="color: '${color}'">${data.name}</span></p>`;
          }
          rowContent += '</td>';
        } else if (rowData.type === 'phone_number') {
          const phone = rowData.phone_number;
          rowContent += `<td><p>${phone}</p></td>`;
        } else if (rowData.type === 'date') {
          const date = rowData.date.start;
          rowContent += `<td><p>${date}</p></td>`;
        } else if (rowData.type === 'number') {
          const value = rowData.number;
          rowContent += `<td><p>${value}</p></td>`;
        } else if (rowData.type === 'email') {
          const email = rowData.email;
          rowContent += `<td><p>${email}</p></td>`;
        } else if (rowData.object === 'list') {
          const results = (rowData as any)?.results;
          const value = results[0].title.text.content;
          rowContent += `<td><p>${value}</p></td>`;
        }
      }
      content += '<tr>' + rowContent + '</tr>';
    }

    content += `</tbody></table>`;
    try {
      const result = await this.pagesService.createConfluencePage(
        spaceKey,
        tableTitle,
        content,
      );

      return result;
    } catch (err) {
      console.log(err);
    }
  }

  createTableHeadings(properties) {
    let content = '';
    const tableHeadings = Object.keys(properties);
    for (const heading of tableHeadings) {
      content += `<th><p>${heading}</p></th>`;
    }
    return content;
  }
}
