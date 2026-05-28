import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  ping() {
    return {
      ok: 'true',
      service: 'Media Service',
      now: new Date().toISOString(),
    }
  }
}
