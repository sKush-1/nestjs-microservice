import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Public } from "../auth/public.decorator";
import { mapRpcErrorToHttpStatus } from "@app/rpc";
import { firstValueFrom } from "rxjs";

@Controller()
export class SearchHttpController {
    constructor(
        @Inject('SEARCH_CLIENT') private readonly searchClient: ClientProxy
    ) { }

    @Get('search')
    @Public()
    async search(@Query('q') q: string, @Query('limit') limit?: string) {
        console.log(q, limit);

        const limitNo = typeof limit === 'string' && limit.trim() ? Number(limit) : undefined;

        try {
            const results = await firstValueFrom(
                this.searchClient.send('search.query', { q, limit: limitNo })
            )
            return {
                q,
                count: Array.isArray(results) ? results.length : 0,
                results
            }
        } catch (error) {
            mapRpcErrorToHttpStatus(error)
        }


    }

}