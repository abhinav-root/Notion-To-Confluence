import { Controller, Get } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}
  @Get()
  getAllIntegrations() {
    return this.integrationsService.getAllIntegrations();
  }
}
