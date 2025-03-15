'use client';

import { useState, useEffect, useCallback } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Star, MessageSquare, Book, Calendar, ChevronRight, Plus, Loader2, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CldImage } from 'next-cloudinary';
import { Manga, MangaDetailProps, Chapter, Review } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Genre } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
// Add this new component for the review card
const ReviewCard = ({ review, onEdit, isAuthor, theme }: {
  review: Review;
  onEdit: () => void;
  isAuthor: boolean;
  theme: string;
}) => (
  <div className={`
    p-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg
    ${theme === "dark" ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white hover:bg-gray-50"}
  `}>
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={`
            ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"}
          `}>
            {review.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{review.username}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4 ${index < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.reviewDatetime).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      {isAuthor && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className={`
            hover:text-white
            ${theme === "dark"
              ? "hover:bg-gray-700 text-white"
              : "hover:bg-blue-500 text-gray-900"
            }
          `}
        >
          Edit
        </Button>
      )}
    </div>
    <p className={`mt-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"
      }`}>
      {review.review}
    </p>
  </div>
);

export default function MangaDetail({ params }: MangaDetailProps) {
  const { user } = useAuth();
  const { theme } = useSettings();
  const { toast } = useToast();
  // const [activeTab, setActiveTab] = useState('description');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [manga, setManga] = useState<Manga | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formErrors, setFormErrors] = useState<{
    rating?: string;
    review?: string;
  }>({});
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    introduction: '',
    genres: [] as number[]
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<number | null>(null);
  const router = useRouter();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [genreError, setGenreError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManga = async () => {
      if (!params.sId) {
        setError('No manga ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch manga details with chapter data
        const mangaResponse = await fetch(`/api/story/${params.sId}`);
        if (!mangaResponse.ok) {
          throw new Error('Failed to fetch manga data');
        }
        const mangaData = await mangaResponse.json();

        // Set hasAccess based on:
        // 1. User is author
        // 2. Chapter is free (price === 0)
        // 3. Chapter has images (meaning it's purchased)
        mangaData.chapters = mangaData.chapters.map((chapter: Chapter) => ({
          ...chapter,
          hasAccess:
            user?.uId === mangaData.authorId ||
            chapter.price === 0 ||
            (chapter.images && chapter.images.length > 0)
        }));

        setManga(mangaData);
        fetchReviews();
      } catch (err) {
        setError('Error fetching manga data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [params.sId, user?.uId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/story/${params.sId}/review`);
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch reviews');
      }

      setReviews(data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // toast({
      //   title: "Error",
      //   description: getErrorMessage(err),
      //   variant: "destructive"
      // });
      setReviews([]);
    }
  };

  const validateForm = (formData: FormData): boolean => {
    const errors: { rating?: string; review?: string } = {};
    const rating = formData.get('rating');
    const review = formData.get('review');

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    if (!review || (review as string).length < 5) {
      errors.review = 'Review must be at least 5 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!validateForm(formData)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/story/${params.sId}/review`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.msg === "You cannot review your own story.") {
          toast({
            title: "Error",
            description: "You cannot review your own story",
            variant: "destructive"
          });
          setIsReviewDialogOpen(false);
          return;
        }
        if (data.msg === "You have already reviewed this story.") {
          throw new Error("You have already reviewed this story");
        }
        throw new Error(data.msg || 'Failed to submit review');
      }

      toast({
        title: "Success",
        description: "Review submitted successfully",
      });

      await fetchReviews();
      setIsReviewDialogOpen(false);
      form.reset();
    } catch (err: any) {
      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingReview) return;

    setIsSubmitting(true);
    setFormErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validate form before submission
    if (!validateForm(formData)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/story/${params.sId}/review`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update review');
      }

      toast({
        title: "Success",
        description: "Review updated successfully",
      });

      await fetchReviews();
      setEditingReview(null);
      setIsReviewDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ReviewForm = ({ onSubmit, initialData = null }: {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>,
    initialData?: Review | null
  }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="rating" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Rating
        </Label>
        <div className="mt-2">
          <Input
            id="rating"
            name="rating"
            type="number"
            min="1"
            max="5"
            defaultValue={initialData?.rating || "5"}
            required
            className={`
              ${formErrors.rating ? "border-red-500" : ""}
              ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white text-gray-900"}
            `}
          />
          {formErrors.rating && (
            <p className="text-sm text-red-500 mt-1">{formErrors.rating}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="review" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Your Review
        </Label>
        <div className="mt-2">
          <Textarea
            id="review"
            name="review"
            defaultValue={initialData?.review || ""}
            required
            className={`
              min-h-[120px]
              ${formErrors.review ? "border-red-500" : ""}
              ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white text-gray-900"}
            `}
          />
          {formErrors.review && (
            <p className="text-sm text-red-500 mt-1">{formErrors.review}</p>
          )}
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {initialData ? "Updating..." : "Submitting..."}
          </>
        ) : (
          initialData ? "Update Review" : "Submit Review"
        )}
      </Button>
    </form>
  );

  // Helper function to extract error message from API response
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;

    // Handle specific API error messages
    if (error.msg) {
      switch (error.msg) {
        case "You cannot review your own story.":
          return "You cannot review your own story";
        case "You have already reviewed this story.":
          return "You have already reviewed this story";
        default:
          return error.msg;
      }
    }

    // Handle ZodError
    if (error.name === 'ZodError' && error.issues?.length > 0) {
      const firstIssue = error.issues[0];
      if (firstIssue.code === 'too_small' && firstIssue.type === 'string') {
        return `Review must be at least ${firstIssue.minimum} characters long`;
      }
      return firstIssue.message || 'Invalid input provided';
    }

    return 'An unexpected error occurred';
  };

  const handlePurchaseChapter = async (chapterId: number, price: number) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setIsPurchasing(true);
    try {
      const response = await fetch(`/api/payment/chapter/${chapterId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // If the chapter is already purchased, update the UI to show "Read Now"
        if (data.msg === "Chapter already purchased or accessible") {
          setManga(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              chapters: prev.chapters.map(ch =>
                ch.cId === chapterId ? { ...ch, hasAccess: true } : ch
              )
            };
          });
          return;
        }
        throw new Error(data.msg || 'Failed to purchase chapter');
      }

      toast({
        title: "Success",
        description: "Chapter purchased successfully",
      });

      // Update local state to show Read Now button
      setManga(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(ch =>
            ch.cId === chapterId ? { ...ch, hasAccess: true } : ch
          )
        };
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to purchase chapter",
        variant: "destructive"
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  // Add this effect to refetch when user logs in/out
  useEffect(() => {
    if (manga) {
      const fetchMangaAccess = async () => {
        try {
          const response = await fetch(`/api/story/${params.sId}${user ? `?userId=${user.uId}` : ''}`);
          if (!response.ok) return;
          const data = await response.json();
          setManga(data);
        } catch (err) {
          console.error('Error updating manga access:', err);
        }
      };
      fetchMangaAccess();
    }
  }, [user?.uId]); // Only run when user ID changes

  const fetchGenres = useCallback(async () => {
    setGenreError(null);
    setIsLoadingGenres(true);
    try {
      const response = await fetch('/api/genre');
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      setAvailableGenres(data.data || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setGenreError('Failed to load genres. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load genres",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGenres(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isEditing) {
      fetchGenres();
    }
  }, [isEditing, fetchGenres]);

  const handleEditClick = () => {
    if (!isEditing && manga) {
      // Convert manga genres to array of gIds
      const currentGenreIds = manga.genres.map((genre: any) =>
        typeof genre === 'object' ? genre.gId : genre
      );

      setEditForm({
        title: manga.title,
        introduction: manga.introduction,
        genres: currentGenreIds
      });
    }
    setIsEditing(!isEditing);
  };

  const toggleGenre = (genreId: number) => {
    setEditForm(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const handleUpdateManga = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // First update the basic manga details
      const formData = new FormData(e.currentTarget);

      // Clear any existing genres from FormData
      formData.delete('genres');

      // Add genres as a string array
      formData.append('genreIds', `[${editForm.genres.join(',')}]`);

      // Handle cover image
      const coverImageInput = e.currentTarget.querySelector('input[name="coverImage"]') as HTMLInputElement;
      if (coverImageInput?.files?.[0]) {
        formData.append('coverImage', coverImageInput.files[0]);
      }


      const response = await fetch(`/api/story/${params.sId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update manga details');

      // Update genres using JSON
      const genreResponse = await fetch(`/api/story/${params.sId}/genre`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genreIds: editForm.genres.map(Number)  // Ensure all IDs are numbers
        }),
      });

      if (!genreResponse.ok) {
        const errorData = await genreResponse.json();
        throw new Error(errorData.msg || 'Failed to update genres');
      }

      // Fetch the updated manga data
      const updatedMangaResponse = await fetch(`/api/story/${params.sId}`);
      const updatedMangaData = await updatedMangaResponse.json();
      setManga(updatedMangaData);

      setIsEditing(false);

      toast({
        title: "Success",
        description: "Manga updated successfully",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update manga",
        variant: "destructive"
      });
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;

    try {
      const response = await fetch(`/api/story/${params.sId}/chapter/${chapterToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chapter');

      setManga(prev => ({
        ...prev!,
        chapters: prev!.chapters.filter(ch => ch.cId !== chapterToDelete),
      }));

      setIsDeleteDialogOpen(false);
      setChapterToDelete(null);

      toast({
        title: "Success",
        description: "Chapter deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chapter",
        variant: "destructive"
      });
    }
  };

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            {manga?.coverImageUrl && (
              <CldImage
                src={manga.coverImageUrl}
                width={500}
                height={700}
                alt={manga.title}
                className="w-full rounded-lg shadow-lg"
              />
            )}
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="font-semibold">
                    {new Date(manga?.postedDatetime || '').toLocaleDateString()}
                  </span>
                </div>
                {manga?.chapters && manga?.chapters.length > 0 && (
                  <Button asChild>
                    <Link
                      href={`/manga/${manga.sId}/chapter/${manga.chapters[0].cId}`}
                    >
                      Start Reading
                    </Link>
                  </Button>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Book className="w-4 h-4 mr-2" />
                <Link 
                  href={`/profile/${manga?.authorId}`}
                  className="hover:underline hover:text-blue-500 transition-colors"
                >
                  {manga?.authorDisplayName}
                </Link>
              </div>
            </div>
            {manga?.genres && manga?.genres.length > 0 && (
              <div className="mt-4">
                <h3 className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {manga?.genres.map((genre: any, index: number) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${theme === "dark"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                        }`}
                    >
                      {typeof genre === 'object' ? genre.genreName : genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4">
              {manga?.chapters && manga.chapters.length > 0 && (
                <Button asChild>
                  <Link
                    href={`/manga/${manga?.sId}/chapter/${manga?.chapters[0].cId}`}
                  >
                    Start Reading
                  </Link>
                </Button>
              )}
            </div>
            <div className="mt-4">

              {/* Author Edit Section */}
              {user?.uId === manga?.authorId && (
                <div className="container py-4">
                  <Button
                    onClick={handleEditClick}
                    variant={isEditing ? "destructive" : "default"}
                    className="mb-4"
                  >
                    {isEditing ? "Cancel Edit" : "Edit Manga"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-2">{manga?.title}</h1>
            <p className="text-gray-500 mb-6">
              by{" "}
              <Link 
                href={`/profile/${manga?.authorId}`}
                className="hover:underline hover:text-blue-500 transition-colors"
              >
                {manga?.authorDisplayName}
              </Link>
            </p>

            <Tabs defaultValue="description" className="w-full">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="chapters">Chapters</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <p className="text-lg leading-relaxed whitespace-pre-line">
                  {manga?.introduction}
                </p>
              </TabsContent>

              <TabsContent value="chapters" className="mt-4">
                {user?.uId === manga?.authorId && (
                  <Button
                    onClick={() => {
                      router.push(`/manga/${manga?.sId}/create-chapter`);
                    }}
                    className="mb-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Chapter
                  </Button>
                )}

                <div className="space-y-4">
                  {manga?.chapters &&
                    manga?.chapters.map((chapter) => (
                      <div
                        key={chapter.cId}
                        className={`p-4 rounded-lg transition-colors ${theme === "dark" ? "bg-gray-800/50" : "bg-white"
                          } shadow-md`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold">
                              Chapter {chapter.chapterSequence}: {chapter.name || "Untitled"}
                            </h3>
                            <div className="flex items-center mt-2 space-x-4 text-sm">
                              {chapter.price > 0 ? (
                                <span className="font-bold text-green-500">
                                  ${chapter.price.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-green-500">Free</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {user?.uId === manga?.authorId && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log("Edit button clicked");
                                    console.log("Chapter ID:", chapter.cId);
                                    console.log("Manga ID:", manga?.sId);
                                    const editUrl = `/manga/${manga?.sId}/chapter/${chapter.cId}/edit-chapter`;
                                    console.log("Navigation URL:", editUrl);
                                    router.push(editUrl);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setChapterToDelete(chapter.cId);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {chapter.price > 0 && !chapter.hasAccess && user?.uId !== manga?.authorId && (
                              <Button
                                onClick={() => handlePurchaseChapter(chapter.cId, chapter.price)}
                                disabled={isPurchasing}
                                variant="secondary"
                                className="flex items-center gap-2"
                              >
                                {isPurchasing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : null}
                                Purchase
                              </Button>
                            )}
                            {(chapter.price === 0 || chapter.hasAccess) && (
                              <Button asChild>
                                <Link href={`/manga/${manga?.sId}/chapter/${chapter.cId}`}>
                                  Read Now
                                  <ChevronRight className="w-5 h-5 ml-1" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-8">
                  <div className={`
                    p-6 rounded-lg shadow-md
                    ${theme === "dark" ? "bg-gray-800/50" : "bg-white"}
                  `}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">Reviews</h2>
                        <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                          Share your thoughts about this story
                        </p>
                      </div>
                      {/* Only show review button if user is logged in AND not the author */}
                      {user && user.uId !== manga?.authorId && (
                        <Dialog
                          open={isReviewDialogOpen}
                          onOpenChange={setIsReviewDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button className="flex items-center space-x-2">
                              <Plus className="w-4 h-4" />
                              <span>Write a Review</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className={`
                            ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"}
                          `}>
                            <DialogHeader>
                              <DialogTitle className={theme === "dark" ? "text-white" : "text-gray-900"}>
                                {editingReview ? "Edit Review" : "Write a Review"}
                              </DialogTitle>
                              <DialogDescription className={
                                theme === "dark" ? "text-gray-400" : "text-gray-500"
                              }>
                                {editingReview
                                  ? "Update your review"
                                  : `Share your thoughts about ${manga?.title}`}
                              </DialogDescription>
                            </DialogHeader>
                            <ReviewForm
                              onSubmit={editingReview ? handleReviewUpdate : handleReviewSubmit}
                              initialData={editingReview}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {/* Reviews list */}
                    <div className="space-y-6">
                      {reviews.length === 0 ? (
                        <div className={`
                          text-center py-12
                          ${theme === "dark" ? "text-gray-400" : "text-gray-500"}
                        `}>
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No reviews yet</p>
                          <p className="mt-1">Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        reviews.map((review) => (
                          <ReviewCard
                            key={review.rsId}
                            review={review}
                            onEdit={() => {
                              setEditingReview(review);
                              setIsReviewDialogOpen(true);
                            }}
                            isAuthor={review.reviewerId === user?.uId}
                            theme={theme}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>



      {/* Edit Form */}
      {isEditing && user?.uId === manga?.authorId && (
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleUpdateManga} className="space-y-6">
            {/* Cover Image Selection */}
            <div className="space-y-4">
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="flex flex-col items-center gap-4">
                {/* Current Cover Image Preview */}
                {manga?.coverImageUrl && (
                  <div className="relative w-48 h-64 group">
                    <CldImage
                      src={manga?.coverImageUrl}
                      width={192}
                      height={256}
                      alt="Current cover"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <p className="text-white text-sm">Current cover</p>
                    </div>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Optional: Preview the selected image
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const preview = document.getElementById('coverPreview') as HTMLImageElement;
                        if (preview && e.target?.result) {
                          preview.src = e.target.result as string;
                          preview.style.display = 'block';
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {/* Custom Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    document.getElementById('coverImage')?.click();
                  }}
                  className="w-48"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Select New Cover
                </Button>

                {/* New Image Preview */}
                <img
                  id="coverPreview"
                  alt="New cover preview"
                  className="w-48 h-64 object-cover rounded-lg hidden"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editForm.title}
                className={theme === "dark" ? "bg-gray-700" : ""}
              />
            </div>

            <div>
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                name="introduction"
                defaultValue={editForm.introduction}
                className={`min-h-[200px] ${theme === "dark" ? "bg-gray-700" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <Label className={`block mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Genres
              </Label>
              {isLoadingGenres ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading genres...</span>
                </div>
              ) : genreError ? (
                <div className="text-red-500">
                  {genreError}
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsLoadingGenres(true);
                      setGenreError(null);
                      fetchGenres();
                    }}
                    className="ml-2 text-blue-500"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableGenres.map((genre) => (
                    <div key={genre.gId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`genre-${genre.gId}`}
                        checked={editForm.genres.includes(genre.gId)}
                        onChange={() => toggleGenre(genre.gId)}
                        className={`w-4 h-4 rounded ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                          }`}
                      />
                      <Label
                        htmlFor={`genre-${genre.gId}`}
                        className={`text-sm cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {genre.genreName}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview section */}
            {!isLoadingGenres && editForm.genres.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  Selected Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {editForm.genres.map((genreId) => {
                    const genre = availableGenres.find(g => g.gId === genreId);
                    return genre && (
                      <span
                        key={genre.gId}
                        className={`px-3 py-1 rounded-full text-sm ${theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                          }`}
                      >
                        {genre.genreName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chapter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChapter}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please login or register to purchase chapters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/login">Login</Link>
            </AlertDialogAction>
            <AlertDialogAction asChild>
              <Link href="/register">Register</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
