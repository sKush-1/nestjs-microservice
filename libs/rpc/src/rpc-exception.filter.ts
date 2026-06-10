import { ArgumentsHost, Catch, RpcExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Observable, throwError } from "rxjs";
import { RpcErrorPayload } from "./rpc.types";

@Catch()
export class RpcAllExceptionsFilter implements RpcExceptionFilter<any> {
    private readonly logger = new Logger(RpcAllExceptionsFilter.name);

    catch(exception: any, host: ArgumentsHost): Observable<any> {
        this.logger.error(`Caught exception in RPC layer: ${exception.message || exception}`, exception.stack);

        if (exception instanceof RpcException) {
            return throwError(() => exception.getError());
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const payload: RpcErrorPayload = {
                code: status === HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
                message: exception.message || 'Validation failed',
                details: exception.getResponse?.(),
            };
            return throwError(() => payload);
        }

        const payload: RpcErrorPayload = {
            code: 'INTERNAL_SERVER_ERROR',
            message: exception.message || 'Internal error',
        };
        return throwError(() => payload);
    }
}
export default RpcAllExceptionsFilter;
