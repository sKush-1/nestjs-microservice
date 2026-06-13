import { Injectable } from '@nestjs/common';
import { SearchProduct, SearchProductDocument } from './search.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SearchService {

  constructor(
    @InjectModel(SearchProduct.name) private readonly model: Model<SearchProductDocument>
  ) { }
  ping() {
    return {
      ok: 'true',
      service: 'Media Service',
      now: new Date().toISOString(),
    }
  }

  normalizedText(input: { name: string; description: string }) {

    return `${input.name} ${input.description}`.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  }

  async upsertFromCatalogEvent(input: {
    productId: string;
    name: string;
    description: string;
    status: string;
    price: number;
    imageUrl?: string;
    createdByClerkUserId: string;
  }) {
    const normalizedText = this.normalizedText({
      name: input.name,
      description: input.description,
    })

    const existing = await this.model.findOneAndUpdate(
      { productId: input.productId },
      {
        name: input.name,
        description: input.description,
        status: input.status,
        price: input.price,
        imageUrl: input.imageUrl,
        createdByClerkUserId: input.createdByClerkUserId,
        normalizedText,
      },
      { upsert: true, new: true, lean: true, setDefaultsOnInsert: true }
    ).lean().exec()

    console.log('search doc added as soon as product is created or updated')
    return existing;
  }

  async query(input: { q: string, limit?: number }) {
    const q = (input.q ?? "").trim().toLowerCase();
    if (!q) {
      return []
    }

    const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\\\$&",), 'i');

    return this.model.find({
      normalizedText: { $regex: regex }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();


  }


}
