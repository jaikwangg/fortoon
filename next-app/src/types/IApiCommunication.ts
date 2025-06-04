export interface IStandardResponse<T = unknown> {
    msg?: string;
    msg2?: string;
    data?: T;
    status?: number;
}

export interface IApiError {
    code: string;
    message: string;
    details?: unknown;
}

export type ApiResponse<T> = IStandardResponse<T> | IApiError;

export interface IApiRequestHandler<T = unknown> {
    (req: Request, params?: Record<string, string>): Promise<ApiResponse<T>>;
}

export interface IApiRouteConfig<T = unknown> {
    GET?: IApiRequestHandler<T>;
    POST?: IApiRequestHandler<T>;
    PUT?: IApiRequestHandler<T>;
    DELETE?: IApiRequestHandler<T>;
}

export interface IApiContext {
    userId?: number;
    isAuthenticated: boolean;
    isAdmin?: boolean;
}