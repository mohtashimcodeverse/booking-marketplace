import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchPropertiesQuery } from './dto/search-properties.query';
import { SearchMapQuery } from './dto/search-map.query';
import { SearchMapViewportQuery } from './dto/search-map-viewport.query';

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  /**
   * Portal-driven: returns exactly what Search Results UI cards need.
   * - Filters/sort/pagination
   * - If checkIn/checkOut provided: filters to only date-available properties (best policy)
   */
  @Get('properties')
  searchProperties(@Query() q: SearchPropertiesQuery) {
    return this.search.searchProperties(q);
  }

  /**
   * Portal-driven: returns exactly what the Map UI needs.
   * - Points: (propertyId, lat, lng, priceFrom, currency)
   * - Same filters as search
   * - If dates provided: map shows only available properties
   *
   * NOTE: This is the "general map query" (radius, optional bounds, etc).
   * For real Google Maps pan/zoom, prefer /search/map-viewport.
   */
  @Get('map')
  searchMap(@Query() q: SearchMapQuery) {
    return this.search.searchMap(q);
  }

  /**
   * ✅ Portal-driven Google Maps viewport API (required for pan/zoom UX)
   * Frontend sends bounds (north/south/east/west) and we return only markers inside.
   */
  @Get('map-viewport')
  searchMapViewport(@Query() q: SearchMapViewportQuery) {
    return this.search.searchMapViewport(q);
  }
}
