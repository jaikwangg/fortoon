'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageSquare, Share2, Trash2, Sun, Moon, Check, Copy } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Post } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { CldImage } from 'next-cloudinary';
import { useSettings } from '@/contexts/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { PostFormData, ReplyFormData, EnhancedPost } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";

const PostCard: React.FC<{ 
  post: EnhancedPost; 
  level?: number;
  onPostUpdate: () => void;
}> = ({ 
  post, 
  level = 0,
  onPostUpdate 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const { theme } = useSettings();
  const { toast } = useToast();
  const { user } = useAuth();

  const [replyFormData, setReplyFormData] = useState<ReplyFormData>({
    title: '',
    content: '',
    images: []
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReplyFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReplyFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleReplySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('postType', 'community');
      formData.append('parentPostId', post.pId.toString());
      formData.append('title', replyFormData.title);
      formData.append('content', replyFormData.content);
      
      replyFormData.images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await fetch('/api/community/post', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }
      
      setReplyFormData({
        title: '',
        content: '',
        images: []
      });
      setIsReplying(false);
      onPostUpdate();
      
      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
    } catch (err) {
      console.error('Error posting reply:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post reply. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isLongContent = post.content?.length > 200;
  const displayContent = isLongContent && !isExpanded 
    ? `${post.content?.substring(0, 200)}...` 
    : post.content || '';

  const handleLike = async () => {
    if (!user?.uId) {
      toast({
        title: "Authentication Required",
        description: "Please login to like posts",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/community/post/${post.pId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Error",
          description: result.msg,
          variant: "destructive"
        });
        return;
      }

      // Update states based on successful response
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

      toast({
        title: isLiked ? "Post Unliked" : "Post Liked",
        description: result.msg,
      });

    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeletePost = async () => {
    try {
      const response = await fetch(`/api/community/post/${post.pId}/hide`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      onPostUpdate();
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting post:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete post'
      });
    }
  };

  const isOwnPost = post.posterId === user?.uId;

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/community/post/${post.pId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: postUrl,
        });
        
        toast({
          title: "Shared Successfully",
          description: "The post has been shared!",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          await copyToClipboard(postUrl);
        }
      }
    } else {
      await copyToClipboard(postUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link Copied!",
        description: "Post link copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ marginLeft: `${level * 2}rem` }}
    >
      <Card className={`mb-4 ${isOwnPost ? 'border-primary/50 border-2' : ''} 
        hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
        ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-current">
            <motion.span
              whileHover={{ scale: 1.01 }}
              className="text-xl font-bold"
            >
              {post.title}
            </motion.span>
            {isOwnPost && (
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90 hover:rotate-12 transition-transform"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Post</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this post? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeletePost}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
          <CardDescription className="flex justify-between items-center text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {post.posterPhotoURL && (
                <CldImage 
                  src={post.posterPhotoURL} 
                  alt="Profile"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="font-medium">
                {post.posterName || 'Anonymous'}
              </span>
            </div>
            <span className="text-muted-foreground">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-current">
          <motion.div 
            className="mb-4"
            initial={false}
            animate={{ height: 'auto' }}
          >
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {displayContent}
            </p>
            {isLongContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 hover:scale-105 transition-transform"
              >
                {isExpanded ? 'Show Less' : 'Read More'}
              </Button>
            )}
          </motion.div>
          
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {Array.isArray(post.images) && post.images.map((image, index) => (
                <motion.div
                  key={index}
                  className="relative w-full h-64 overflow-hidden rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <CldImage
                    src={image}
                    alt={`Post image ${index + 1}`}
                    // fill
                    width={400}
                    height={400}
                    style={{objectFit: "cover"}}
                    className="transition-transform duration-300 hover:scale-105 rounded-lg"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={`flex items-center gap-2 p-2 rounded-full
                ${isLiked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'} 
                transition-colors`}
              onClick={handleLike}
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${isLiked ? 'fill-current' : ''}`} 
              />
              <span>{likeCount}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 p-2 rounded-full
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsReplying(!isReplying)}
              disabled={isSubmitting}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{isReplying ? 'Cancel' : 'Reply'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 p-2 rounded-full
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </motion.button>
          </div>
        </CardFooter>

        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <form onSubmit={handleReplySubmit} className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor={`reply-title-${post.pId}`}>Title</Label>
                    <Input 
                      id={`reply-title-${post.pId}`}
                      name="title"
                      value={replyFormData.title}
                      onChange={handleInputChange}
                      placeholder="Reply title"
                      required
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reply-content-${post.pId}`}>Your Reply</Label>
                    <textarea
                      id={`reply-content-${post.pId}`}
                      name="content"
                      value={replyFormData.content}
                      onChange={handleInputChange}
                      placeholder="Write your reply..."
                      required
                      disabled={isSubmitting}
                      className="w-full min-h-[100px] p-2 border rounded-md mt-1
                        focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reply-image-${post.pId}`}>Image (optional)</Label>
                    <Input
                      id={`reply-image-${post.pId}`}
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto transition-all duration-300
                      hover:scale-105 active:scale-95"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit Reply'
                    )}
                  </Button>
                </form>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        {post.children && post.children.length > 0 && (
          <CardContent className="pt-0">
            {post.children.map(childPost => (
              <PostCard 
                key={childPost.pId} 
                post={childPost} 
                level={level + 1}
                onPostUpdate={onPostUpdate}
              />
            ))}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { theme } = useSettings();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [postFormData, setPostFormData] = useState<PostFormData>({
    title: '',
    content: '',
    images: []
  });

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/community/post');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch posts');
      }
      const result = await response.json();
      const visiblePosts = result.data.posts.filter((post: Post) => post.hidden === 0);
      setPosts(visiblePosts);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch posts",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPostFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024;
        
        if (!isValidType) {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
          });
        }
        
        if (!isValidSize) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: `${file.name} exceeds 5MB limit.`,
          });
        }
        
        return isValidType && isValidSize;
      });

      setPostFormData(prev => ({ ...prev, images: validFiles }));
    }
  };

  const resetForm = () => {
    setPostFormData({
      title: '',
      content: '',
      images: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitPost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (postFormData.title.trim().length < 3) {
      toast({
        title: "Error",
        description: "Title must be at least 3 characters long",
        variant: "destructive"
      });
      return;
    }

    if (postFormData.content.trim().length < 10) {
      toast({
        title: "Error",
        description: "Content must be at least 10 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('postType', 'community');
      formData.append('title', postFormData.title);
      formData.append('content', postFormData.content);
      
      postFormData.images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await fetch('/api/community/post', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit post');
      }
      
      resetForm();
      fetchPosts();
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    } catch (err) {
      console.error('Error submitting post:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userPosts = posts.filter(post => post.posterId === user?.uId);

  const trendingPosts = [...posts].sort((a, b) => {
    return (b.likeCount || 0) - (a.likeCount || 0);
  }).slice(0, 10);

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>Create a New Post</CardTitle>
          <CardDescription>
            Share your thoughts with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <Label htmlFor="post-title">Title</Label>
              <Input 
                id="post-title" 
                name="title"
                value={postFormData.title}
                onChange={handleInputChange}
                placeholder="Enter post title" 
                required
                disabled={isSubmitting}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="post-content">Your Post</Label>
              <textarea
                id="post-content"
                name="content"
                value={postFormData.content}
                onChange={handleInputChange}
                placeholder="What's on your mind?"
                required
                disabled={isSubmitting}
                className="w-full min-h-[100px] p-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <Label htmlFor="post-image">Images (optional)</Label>
              <Input 
                id="post-image" 
                name="image" 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                multiple
                disabled={isSubmitting}
                className="bg-background"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </div>
              ) : (
                'Create Post'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="my-posts">My Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {posts.length > 0 ? (
            posts.map(post => (
              <PostCard 
                key={post.pId} 
                post={post}
                onPostUpdate={fetchPosts}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground">No posts available.</p>
          )}
        </TabsContent>
        <TabsContent value="trending">
          {trendingPosts.length > 0 ? (
            trendingPosts.map(post => (
              <PostCard 
                key={post.pId} 
                post={post}
                onPostUpdate={fetchPosts}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground">No trending posts available.</p>
          )}
        </TabsContent>
        <TabsContent value="my-posts">
          {userPosts.length > 0 ? (
            userPosts.map(post => (
              <PostCard 
                key={post.pId} 
                post={post}
                onPostUpdate={fetchPosts}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground">You haven&apos;t created any posts yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityPage;