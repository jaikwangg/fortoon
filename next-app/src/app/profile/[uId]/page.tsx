'use client';
import { useState, useCallback, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useSettings } from '@/contexts/SettingsContext';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';

type UserProfile = {
  uId: number;
  username: string;
  displayName: string;
  profilePicUrl: string;
}

type UserManga = {
  sId: number;
  title: string;
  introduction: string;
  postedDatetime: string;
  authorId: number;
  coverImageUrl: string;
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

export default function UserProfile({ params }: { params: { uId: string } }) {
  const { theme } = useSettings();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userManga, setUserManga] = useState<UserManga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/${params.uId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user profile');
      }
      
      setUserProfile(data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user profile');
    }
  }, [params.uId]);

  const fetchUserManga = useCallback(async () => {
    try {
      const response = await fetch(`/api/story`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch manga');
      }
      
      const userMangaList = data.data.filter((manga: UserManga) =>
        manga.authorId === parseInt(params.uId)
      );
      setUserManga(userMangaList);
      setError(null);
    } catch (error) {
      console.error('Error fetching user manga:', error);
      setError(error instanceof Error ? error.message : 'Failed to load manga');
    } finally {
      setIsLoading(false);
    }
  }, [params.uId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchUserProfile(), fetchUserManga()])
      .finally(() => setIsLoading(false));
  }, [fetchUserProfile, fetchUserManga]);

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} 
        flex items-center justify-center`}>
        <div className="text-center p-4">
          <h2 className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {error}
          </h2>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-4">
        <Card className={`w-full overflow-hidden ${theme === 'dark'
          ? 'bg-gradient-to-br from-purple-900 via-pink-900 to-red-900'
          : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'
          }`}>
          <CardHeader className="flex flex-col md:flex-row items-center justify-between p-6">
            <div className="flex flex-col md:flex-row items-center md:space-x-6 text-white">
              <div className="w-32 h-32 rounded-full bg-white p-1 mb-4 md:mb-0">
                <div className="w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center">
                  {userProfile?.profilePicUrl ? (
                    <CldImage
                      src={userProfile.profilePicUrl}
                      alt="Profile picture"
                      className="w-full h-full rounded-full"
                      width={128}
                      height={128}
                    />
                  ) : (
                    <User size={64} className="text-white" />
                  )}
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold">{userProfile?.displayName || 'Loading...'}</h2>
              </div>
            </div>
          </CardHeader>

          <CardContent className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                </div>
              ) : userManga.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userManga.map((manga) => (
                    <Link href={`/manga/${manga.sId}`} key={manga.sId}>
                      <div className={`border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <CldImage
                          src={manga.coverImageUrl}
                          alt={manga.title}
                          className="w-full h-48 object-cover"
                          width={300}
                          height={300}
                        />
                        <div className="p-4">
                          <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {manga.title}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Chapters: {manga.chapters.length}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Posted: {new Date(manga.postedDatetime).toLocaleDateString()}
                          </p>
                          {manga.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {manga.genres.map(genre => (
                                <span
                                  key={genre.gId}
                                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full"
                                >
                                  {genre.genreName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    This user hasn`t created any manga yet.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 