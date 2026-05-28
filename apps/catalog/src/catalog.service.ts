import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  ping() {
    return {
      ok: 'true',
      service: 'Catalog',
      now: new Date().toISOString(),
    }
  }
}
