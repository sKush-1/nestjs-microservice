import { Controller, Get } from '@nestjs/common';
import { MediaService } from './media.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadProductImageDto } from './media/media.dto';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

 
   @MessagePattern('service.ping')
  ping() {
    return this.mediaService.ping();
  }

  @MessagePattern('media.uploadProductImage')
  uploadProductImage(@Payload() payload: UploadProductImageDto){
    return this.mediaService.uploadProductImage(payload.fileName, payload.mimeType, payload.base64, payload.uploadByUserId);
  }

  @MessagePattern('media.attachToProduct')
  attachToProduct(@Payload() payload: { mediaId: string, productId: string, attachedByUserId?: string }) {
    return this.mediaService.attachToProduct(payload.mediaId, payload.productId, payload.attachedByUserId);
  }


}
