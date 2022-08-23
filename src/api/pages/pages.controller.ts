import { Body, Controller, Post } from '@nestjs/common';
import { ConvertPageDto } from './dtos/convert-page.dto';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}
  @Post()
  convertNotionPageToConfluence(@Body() convertPageDto: ConvertPageDto) {
    return this.pagesService.convertNotionPageToConfluence(convertPageDto);
  }
}
