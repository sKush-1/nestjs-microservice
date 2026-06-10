import { Injectable } from '@nestjs/common';
import { initCloudinary } from './cloudinary/cloudinary.client';
import { InjectModel } from '@nestjs/mongoose';
import { Media, MediaDocument } from './media/media.schema';
import { Model } from 'mongoose';
import { rpcBadRequest, rpcNotFound } from '@app/rpc';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class MediaService {

  private readonly cloudinary = initCloudinary();
  constructor(
    @InjectModel(Media.name) private mediaModel : Model<MediaDocument>
  ) {}

  async uploadProductImage(fileName: string, mimeType: string, base64: string, uploadByUserId: string) {
    if(!fileName || !mimeType || !base64 || !uploadByUserId) {
      rpcBadRequest("Missing required fields for uploading product image");
    }

    if(!mimeType.startsWith("image/")) {
      rpcBadRequest("Invalid mime type. Only image files are allowed");
    }

    const buffer = Buffer.from(base64, 'base64');
    if(buffer.length > 5 * 1024 * 1024) { // 5MB limit
      rpcBadRequest("File size exceeds the 5MB limit");
    }

    const uploadResult = await new Promise<UploadApiResponse | undefined>((resolve,reject)=> {
      const stream = this.cloudinary.uploader.upload_stream({
        folder: "media_images",
        public_id: `${Date.now()}_${fileName}`,
        resource_type: "image",
      },(err,result)=> {
        if(err) {
          reject(err);
          return;
        } else {
          resolve(result);

        }
      })
      stream.end(buffer);
    })

    const url = uploadResult?.secure_url;
    const publicId = uploadResult?.public_id;
    if(!url || !publicId) {
      rpcBadRequest("Failed to upload image to Cloudinary");
    }
    
    const mediaDoc = await this.mediaModel.create({
      url,
      publicId,
      uploadByUserId: uploadByUserId,
      productId: undefined,
    }) as MediaDocument;

    return {
      mediaId: String(mediaDoc._id),
      url,
      publicId,
    };
  }

  async attachToProduct(mediaId: string, productId: string, attachedByUserId?: string) {
    if(!mediaId || !productId) {
      rpcBadRequest("Missing required fields for attaching media to product");
    }

    const updated = await this.mediaModel.findByIdAndUpdate(mediaId, {
      $set: {
        productId: productId,
      }
    }, { new: true }).exec() as MediaDocument | null;
    
    if (!updated) {
      rpcNotFound("Media not found with the given mediaId");
    }

    return {
      mediaId: String(updated._id),
      productId: updated.productId,
      url: updated.url,
      publicId: updated.publicId,
    };
  }
    

  ping() {
    return {
      ok: 'true',
      service: 'Media Service',
      now: new Date().toISOString(),
    }
  }
}
