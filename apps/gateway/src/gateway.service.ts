import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  ping() {
    return {
      ok: 'true',
      service: 'Catalog',
      now: new Date().toISOString(),
    }
  }
}
