import { apiClient } from './api-client';
import {
    IUserApi,
    IStoryApi,
    IPostApi,
    IChapterApi,
    IReviewApi,
    ICommentApi,
    IUser,
    IStory,
    IChapter,
    IReview,
    IComment,
    IPost,
    ApiResponse
} from '@/types/api';

class ApiService {
    // User API
    async register(data: IUserApi['register']['request']): Promise<ApiResponse<IUserApi['register']['response']>> {
        return apiClient.post('/auth/register', data);
    }

    async login(data: IUserApi['login']['request']): Promise<ApiResponse<IUserApi['login']['response']>> {
        return apiClient.post('/auth/login', data);
    }

    async getUser(userId: string): Promise<ApiResponse<IUser>> {
        return apiClient.get(`/user/${userId}`);
    }

    async updateUser(userId: string, data: IUserApi['update']['request']): Promise<ApiResponse<IUser>> {
        return apiClient.put(`/user/${userId}`, data);
    }

    // Story API
    async createStory(data: IStoryApi['create']['request']): Promise<ApiResponse<IStory>> {
        return apiClient.post('/story', data);
    }

    async getStory(storyId: string): Promise<ApiResponse<IStory>> {
        return apiClient.get(`/story/${storyId}`);
    }

    async updateStory(storyId: string, data: IStoryApi['update']['request']): Promise<ApiResponse<IStory>> {
        return apiClient.put(`/story/${storyId}`, data);
    }

    async deleteStory(storyId: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/story/${storyId}`);
    }

    // Chapter API
    async createChapter(storyId: string, data: IChapterApi['create']['request']): Promise<ApiResponse<IChapter>> {
        return apiClient.post(`/story/${storyId}/chapter`, data);
    }

    async getChapter(storyId: string, chapterId: string): Promise<ApiResponse<IChapter>> {
        return apiClient.get(`/story/${storyId}/chapter/${chapterId}`);
    }

    async updateChapter(
        storyId: string,
        chapterId: string,
        data: IChapterApi['update']['request']
    ): Promise<ApiResponse<IChapter>> {
        return apiClient.put(`/story/${storyId}/chapter/${chapterId}`, data);
    }

    async deleteChapter(storyId: string, chapterId: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/story/${storyId}/chapter/${chapterId}`);
    }

    // Review API
    async createReview(storyId: string, data: IReviewApi['create']['request']): Promise<ApiResponse<IReview>> {
        return apiClient.post(`/story/${storyId}/review`, data);
    }

    async getReviews(storyId: string): Promise<ApiResponse<IReview[]>> {
        return apiClient.get(`/story/${storyId}/review`);
    }

    async updateReview(
        storyId: string,
        reviewId: string,
        data: IReviewApi['update']['request']
    ): Promise<ApiResponse<IReview>> {
        return apiClient.put(`/story/${storyId}/review/${reviewId}`, data);
    }

    async deleteReview(storyId: string, reviewId: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/story/${storyId}/review/${reviewId}`);
    }

    // Comment API
    async createComment(
        storyId: string,
        chapterId: string,
        data: ICommentApi['create']['request']
    ): Promise<ApiResponse<IComment>> {
        return apiClient.post(`/story/${storyId}/chapter/${chapterId}/comment`, data);
    }

    async getComments(storyId: string, chapterId: string): Promise<ApiResponse<IComment[]>> {
        return apiClient.get(`/story/${storyId}/chapter/${chapterId}/comment`);
    }

    async updateComment(
        storyId: string,
        chapterId: string,
        commentId: string,
        data: ICommentApi['update']['request']
    ): Promise<ApiResponse<IComment>> {
        return apiClient.put(`/story/${storyId}/chapter/${chapterId}/comment/${commentId}`, data);
    }

    async deleteComment(storyId: string, chapterId: string, commentId: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/story/${storyId}/chapter/${chapterId}/comment/${commentId}`);
    }

    // Post API
    async createPost(data: IPostApi['create']['request']): Promise<ApiResponse<IPost>> {
        return apiClient.post('/post', data);
    }

    async getPost(postId: string): Promise<ApiResponse<IPost>> {
        return apiClient.get(`/post/${postId}`);
    }

    async updatePost(postId: string, data: IPostApi['update']['request']): Promise<ApiResponse<IPost>> {
        return apiClient.put(`/post/${postId}`, data);
    }

    async deletePost(postId: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/post/${postId}`);
    }

    // File Upload
    async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
        return apiClient.uploadFile('/upload/image', file);
    }

    async uploadChapterContent(file: File): Promise<ApiResponse<{ content: string }>> {
        return apiClient.uploadFile('/upload/chapter', file);
    }
}

export const apiService = new ApiService(); 