import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class SearchQueryDto {
    @IsString()
    q: string;

    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(20, { message: 'Limit must be at most 20' })
    limit?: number;
}