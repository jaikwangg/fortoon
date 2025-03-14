import { translations } from '@/lib/translations';

export type Language = 'en' | 'th';
export type Theme = 'light' | 'dark' ;
export type FontSize = 'small' | 'medium' | 'large';

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

export interface User {
  uId: number;
  username: string;
  credit: number;
  age: number;
  displayName: string;
  profilePicUrl: string;
  bgUrl: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginSuccess: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: (key: keyof typeof translations.en) => string;
}

export interface FormData {
  username: string;
  password: string;
  displayName: string;
  sex: string;
  email: string;
  profilePic: File | null;
  age: string;
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

export interface PostFormData {
  title: string;
  content: string;
  images: File[];
}

export interface ReplyFormData {
  title: string;
  content: string;
  images: File[];
}
// Extend Post type to include likes
export interface EnhancedPost extends Post {
  likeCount: number;
  posterName?: string;
  likes?: number;
  isLiked?: boolean;
  hidden: number;
}

export interface MangaFormData {
  title: string;
  description: string;
  genre: number[];
  coverImage: File | null;
}

export type Genre = {
  gId: number;
  genreName: string;
};