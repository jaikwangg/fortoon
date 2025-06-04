import { z } from 'zod';
import { IStandardResponse, ApiResponse } from './IApiCommunication';

// Base API Types
export interface IApiRequest<T> {
    body: T;
    query?: Record<string, string>;
    params?: Record<string, string>;
}

export interface IApiSuccessResponse<T> extends IStandardResponse<T> {
    code: 'SUCCESS';
    data: T;
    status: number;
}

export interface IApiErrorResponse extends IStandardResponse<never> {
    code: 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR' | 'API_ERROR';
    message: string;
    details?: unknown;
    status: number;
}

export interface IDatabaseResult<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

// API Endpoint Types
export interface IUserApi {
    register: {
        request: {
            email: string;
            password: string;
            username: string;
            name: string;
            sex?: string;
            age?: number;
            profilePic?: File;
        };
        response: {
            id: number;
            email: string;
            username: string;
            displayName: string;
            created_at: Date;
        };
    };
    login: {
        request: {
            email: string;
            password: string;
        };
        response: {
            token: string;
            user: {
                id: number;
                email: string;
                username: string;
                displayName: string;
            };
        };
    };
    update: {
        request: {
            displayName?: string;
            email?: string;
            profilePic?: File;
        };
        response: {
            id: number;
            email: string;
            username: string;
            displayName: string;
            profilePicUrl?: string;
        };
    };
}

export interface IStoryApi {
    create: {
        request: {
            title: string;
            description: string;
            coverImage?: File;
            genres: string[];
        };
        response: {
            id: number;
            title: string;
            description: string;
            coverImageUrl?: string;
            genres: string[];
            authorId: number;
            created_at: Date;
        };
    };
    update: {
        request: {
            title?: string;
            description?: string;
            coverImage?: File;
            genres?: string[];
        };
        response: {
            id: number;
            title: string;
            description: string;
            coverImageUrl?: string;
            genres: string[];
            authorId: number;
            updated_at: Date;
        };
    };
}

export interface IChapterApi {
    create: {
        request: {
            title: string;
            content: string;
            price?: number;
        };
        response: {
            id: number;
            title: string;
            content: string;
            price?: number;
            storyId: number;
            chapterNumber: number;
            created_at: Date;
        };
    };
    update: {
        request: {
            title?: string;
            content?: string;
            price?: number;
        };
        response: {
            id: number;
            title: string;
            content: string;
            price?: number;
            storyId: number;
            chapterNumber: number;
            updated_at: Date;
        };
    };
}

export interface IReviewApi {
    create: {
        request: {
            rating: number;
            comment: string;
        };
        response: {
            id: number;
            rating: number;
            comment: string;
            storyId: number;
            userId: number;
            created_at: Date;
        };
    };
    update: {
        request: {
            rating?: number;
            comment?: string;
        };
        response: {
            id: number;
            rating: number;
            comment: string;
            storyId: number;
            userId: number;
            updated_at: Date;
        };
    };
}

export interface ICommentApi {
    create: {
        request: {
            content: string;
            parentId?: number;
        };
        response: {
            id: number;
            content: string;
            userId: number;
            chapterId: number;
            parentId?: number;
            created_at: Date;
        };
    };
    update: {
        request: {
            content: string;
        };
        response: {
            id: number;
            content: string;
            userId: number;
            chapterId: number;
            parentId?: number;
            updated_at: Date;
        };
    };
}

export interface IPostApi {
    create: {
        request: {
            title: string;
            content: string;
            images?: File[];
            parentId?: number;
        };
        response: {
            id: number;
            title: string;
            content: string;
            imageUrls?: string[];
            userId: number;
            parentId?: number;
            created_at: Date;
        };
    };
    update: {
        request: {
            title?: string;
            content?: string;
            images?: File[];
        };
        response: {
            id: number;
            title: string;
            content: string;
            imageUrls?: string[];
            userId: number;
            parentId?: number;
            updated_at: Date;
        };
    };
}

// Validation Schemas
export const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(3).max(50),
    name: z.string().min(2).max(100),
    sex: z.string().optional(),
    age: z.number().min(0).max(120).optional(),
});

export const storySchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    genres: z.array(z.string()).min(1),
});

export const chapterSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    price: z.number().min(0).optional(),
});

export const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(1).max(1000),
});

export const commentSchema = z.object({
    content: z.string().min(1).max(1000),
    parentId: z.number().optional(),
});

export const postSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
    parentId: z.number().optional(),
});

// Type Guards
export function isApiError(response: ApiResponse<unknown>): response is IApiErrorResponse {
    return 'code' in response && response.code !== 'SUCCESS';
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is IApiSuccessResponse<T> {
    return 'code' in response && response.code === 'SUCCESS';
} 