'use client'
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext'; 
import { MangaFormData } from '@/lib/types';
import Image from 'next/image';
import { useSettings } from '@/contexts/SettingsContext';

interface Genre {
  gId: number;
  genreName: string;
}

const CreateManga: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); 
  const { theme } = useSettings();

  const [formData, setFormData] = useState<MangaFormData>({
    title: '',
    description: '',
    genre: [],
    coverImage: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genre');
        const data = await response.json();
        setGenres(data.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, coverImage: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreChange = (gId: number) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(gId)
        ? prev.genre.filter(id => id !== gId)
        : [...prev.genre, gId]
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user?.uId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to create a story.",
      });
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First create the story
      const formDataToSend = new FormData();
      formDataToSend.append('authorId', user.uId.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('introduction', formData.description);
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      const response = await fetch(`/api/story`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.msg2?.includes('Duplicated Key title')) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "This title already exists. Please choose a different title.",
          });
          return;
        }
        throw new Error(result.msg || 'Failed to create story');
      }

      const storyId = result.data.storyId;
      
      if (!storyId) {
        throw new Error('Story ID not found in response');
      }

      // Then update the genres
      if (formData.genre.length > 0) {
        const genreResponse = await fetch(`/api/story/${storyId}/genre`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            genreIds: formData.genre
          }),
        });

        if (!genreResponse.ok) {
          throw new Error('Failed to update genres');
        }
      }

      toast({
        title: "Success",
        description: "Story created successfully!",
      });
      
      router.push(`/manga/${storyId}`);
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create story. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-4">
        <Card className={`w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <h1 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create New Manga
            </h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Title
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className={`w-full ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  disabled={isSubmitting}
                  className={`w-full ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Genres
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {genres.map((genre) => (
                    <div key={genre.gId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`genre-${genre.gId}`}
                        checked={formData.genre.includes(genre.gId)}
                        onChange={() => handleGenreChange(genre.gId)}
                        className={`w-4 h-4 rounded ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-300'
                        }`}
                      />
                      <Label 
                        htmlFor={`genre-${genre.gId}`}
                        className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {genre.genreName}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Cover Image
                </Label>
                <Input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isSubmitting}
                  className={`cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                />
                {imagePreview && (
                  <div className="mt-4">
                    <Image 
                      src={imagePreview} 
                      alt="Cover preview" 
                      width={300}
                      height={200}
                      className="rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              <CardFooter className="flex justify-end px-0">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Manga'
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateManga;