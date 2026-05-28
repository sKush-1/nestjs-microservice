import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
    ping() {
    return {
      ok: 'true',
      service: 'Media Service',
      now: new Date().toISOString(),
    }
  }
}
