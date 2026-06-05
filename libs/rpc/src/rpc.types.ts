export type RpcErrorCode = 'BAD_REQUEST' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR';

export type RpcErrorPayload = {
    code: RpcErrorCode;
    message: string;
    details?: any;
}