import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { RpcException } from "@nestjs/microservices";
import { Response } from "express";
import { RpcErrorPayload } from "./rpc.types";

@Catch()
export class RpcAllExceptionsFilter extends BaseExceptionFilter {
    catch(exception: any, host: ArgumentsHost){

        if(exception instanceof RpcException){
            return super.catch(exception, host);
        }

        const status = exception?.getStatus?.();
        const ctx = host.switchToHttp();
            const request = ctx.getRequest();
            const response = ctx.getResponse<Response>();    

        if(status == 400 ){
            const payload:RpcErrorPayload = {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: response
            }

            return super.catch(new RpcException(payload), host);
        }

        const payload:RpcErrorPayload = {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal error',
        }
        return super.catch(new RpcException(payload), host);

    }
}
export default RpcAllExceptionsFilter;
    
