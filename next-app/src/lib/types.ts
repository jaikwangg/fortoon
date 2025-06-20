import { translations } from '@/lib/translations';
import type { TSex } from '../types/ISex';

// Theme and UI Types
export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type Language = 'en' | 'ja' | 'ko';

// User Types
export interface User {
    uId: number;
    username: string;
    credit: number;
    age: number;
    displayName: string;
    profilePicUrl: string;
    bgUrl: string;
}

// Auth Types
export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    loginSuccess: boolean;
}

export interface AuthContextType extends AuthState {
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Settings Types
export interface SettingsState {
    language: Language;
    theme: Theme;
    fontSize: FontSize;
}

export interface SettingsContextType extends SettingsState {
    setLanguage: (lang: Language) => void;
    setTheme: (theme: Theme) => void;
    setFontSize: (size: FontSize) => void;
    t: (key: keyof typeof translations.en) => string;
}

// Form Types
export interface BaseFormData {
    title?: string;
    content?: string;
    images?: File[];
}

export interface UserFormData extends BaseFormData {
    username: string;
    password: string;
    displayName: string;
    sex: TSex;
    email: string;
    profilePic: File | null;
    age: string;
}

export interface PostFormData extends BaseFormData {
    title: string;
    content: string;
    images: File[];
    postType?: string;
    parentPostId?: number | null;
}

export interface ReplyFormData extends BaseFormData {
    title: string;
    content: string;
    images: File[];
    parentPostId: number;
}

export interface MangaFormData extends BaseFormData {
    title: string;
    description: string;
    genre: number[];
    coverImage: File | null;
}

// Component Props Types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface DialogProps extends BaseComponentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface CardProps extends BaseComponentProps {
    title?: string;
    description?: string;
}

export interface MangaItem {
  id: number;
  title: string;
  cover: string;
  rating: number;
  chapter: number;
  views: string;
}

export interface FeaturedManga {
  title: string;
  description: string;
  cover: string;
  rating: number;
  genres: string[];
}

export interface TranslationKeys {
  // Hero Section
  discover: string;
  searchPlaceholder: string;
  browseAll: string;
  
  // Featured Section
  featured: string;
  readNow: string;
  chapter: string;
  views: string;
  
  // Manga List
  browseManga: string;
  popular: string;
  latest: string;
  topStories: string;
  viewAll: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    loginSuccess: boolean;
}

export interface AuthContextType extends AuthState {
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export interface SettingsState {
    language: Language;
    theme: Theme;
    fontSize: FontSize;
}

export interface SettingsContextType extends SettingsState {
    setLanguage: (lang: Language) => void;
    setTheme: (theme: Theme) => void;
    setFontSize: (size: FontSize) => void;
    t: (key: keyof typeof translations.en) => string;
}

export interface BaseFormData {
    title?: string;
    content?: string;
    images?: File[];
}

export interface UserFormData extends BaseFormData {
    username: string;
    password: string;
    displayName: string;
    sex: TSex;
    email: string;
    profilePic: File | null;
    age: string;
}

export interface PostFormData extends BaseFormData {
    title: string;
    content: string;
    images: File[];
    postType?: string;
    parentPostId?: number | null;
}

export interface ReplyFormData extends BaseFormData {
    title: string;
    content: string;
    images: File[];
    parentPostId: number;
}

export interface MangaFormData extends BaseFormData {
    title: string;
    description: string;
    genre: number[];
    coverImage: File | null;
}

export interface FormErrors {
  [key: string]: string;
}

export interface Post {
  hidden: number;
  pId: string;
  title: string;
  content: string;
  posterId: number,
  createdAt: string;
  images: string[];
  children: Post[];
  postType?: string;
  parentPostId?: number | null;
  posterPhotoURL?: string;
  posterName?: string;
  likeCount: number;
}

export interface MangaDetailProps {
  params: {
    sId: string;
  };
}

export interface Chapter {
  name: string;
  cId: number;
  storyId: number;
  chapterSequence: number;
  price: number;
  images: string[];
  hasAccess?: boolean;
}

export interface Review {
  rsId: number;
  reviewerId: number;
  username: string;
  rating: number;
  email: string;
  review: string;
  reviewDatetime: string;
}

export interface Manga {
  sId: number;
  title: string;
  introduction: string;
  postedDatetime: string;
  authorId: number;
  coverImageUrl: string;
  authorDisplayName: string;
  chapters: Chapter[];
  genres: string[];
  rating: number;
}

export interface PostCardProps {
  post: Post;
  level?: number;
  currentUserId: number | undefined;
  onPostUpdate: () => void;
}

// Extend Post type to include likes
export interface EnhancedPost extends Post {
  likeCount: number;
  posterName?: string;
  likes?: number;
  isLiked?: boolean;
  hidden: number;
}

export interface Genre {
  gId: number;
  genreName: string;
}

export type { TSex };

export interface UserManga {
  sId: number;
  title: string;
  introduction: string;
  postedDatetime: string;
  authorId: number;
  coverImageUrl: string;
  profilePicUrl: string;
  chapters: {
    name: string;
    cId: number;
    storyId: number;
    chapterSequence: number;
    price: number;
  }[];
  genres: {
    gId: number;
    genreName: string;
  }[];
};