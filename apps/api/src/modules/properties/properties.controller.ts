import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { ListPropertiesDto } from './dto/list-properties.dto';
import { PropertyDetailParams } from './dto/property-detail.params';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @Get()
  async list(@Query() query: ListPropertiesDto) {
    return this.properties.list(query);
  }

  @Get(':slug')
  async bySlug(@Param() params: PropertyDetailParams) {
    const property = await this.properties.bySlug(params.slug);
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }
}
