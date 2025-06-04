import { IApiClient, ApiResponse, IApiErrorResponse } from '@/types/api';

class ApiClient implements IApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl;
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const data = await response.json();

        if (!response.ok) {
            return {
                code: 'API_ERROR',
                message: data.msg || 'An error occurred',
                details: data.msg2,
                status: response.status
            } as IApiErrorResponse;
        }

        return {
            ...data,
            status: response.status
        };
    }

    private getUrl(path: string, params?: Record<string, string>): string {
        const url = new URL(`${this.baseUrl}${path}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }
        return url.toString();
    }

    async get<T>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
        const response = await fetch(this.getUrl(path, params), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return this.handleResponse<T>(response);
    }

    async post<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
        const response = await fetch(this.getUrl(path), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        return this.handleResponse<T>(response);
    }

    async put<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
        const response = await fetch(this.getUrl(path), {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        return this.handleResponse<T>(response);
    }

    async delete<T>(path: string): Promise<ApiResponse<T>> {
        const response = await fetch(this.getUrl(path), {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return this.handleResponse<T>(response);
    }

    async uploadFile<T>(path: string, file: File, fieldName: string = 'file'): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append(fieldName, file);

        const response = await fetch(this.getUrl(path), {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        return this.handleResponse<T>(response);
    }
}

export const apiClient = new ApiClient(); 