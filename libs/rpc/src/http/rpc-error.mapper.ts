import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";

export function mapRpcErrorToHttpStatus(err:any): never{
    const payload = err?.error
    const code = payload?.code as string || 'Undefined error code';
    const message = payload?.message as string || 'Undefined error message'; 

    if(code === 'VALIDATION_ERROR' || code === 'BAD_REQUEST'){
        throw new BadRequestException(message);
    }

    if(code === 'NOT_FOUND'){
        throw new NotFoundException(message);
    }

    if(code === 'UNAUTHORIZED'){
        throw new UnauthorizedException(message);
    }

    if(code === 'FORBIDDEN'){
        throw new ForbiddenException(message);
    }

    throw new InternalServerErrorException(message);
}