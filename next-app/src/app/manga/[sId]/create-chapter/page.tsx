"use client";

import React, { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Use useParams for route parameters
import { useSettings } from "@/contexts/SettingsContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

// TypeScript type for file previews
type FilePreview = {
  url: string;
  name: string;
};

export default function CreateChapter() {
  const { theme } = useSettings();
  const router = useRouter();
  const { sId: mangaId } = useParams(); // Get the route params

  const [chapterImages, setChapterImages] = useState<File[]>([]); // State to hold images
  const [imagePreviews, setImagePreviews] = useState<FilePreview[]>([]); // To preview the images
  const [viewMode, setViewMode] = useState<'preview' | 'name'>('preview'); // State to toggle between preview and name view
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null); // Track the dragging image index
  const [error, setError] = useState<string>(""); // To handle errors
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // For finish confirmation dialog
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false); // For empty images error dialog
  const [chapterName, setChapterName] = useState<string>("");
  const [priceType, setPriceType] = useState<'free' | 'coin'>('free');
  const [coinPrice, setCoinPrice] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to the file input
  const { toast } = useToast(); // Add this hook

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[]; // Ensure that files are typed as File[]

    // Check if the user tries to add more than 50 images
    if (files.length + chapterImages.length > 50) {
      setError("You can upload a maximum of 50 images.");
      return;
    }

    setError(""); // Clear previous errors

    const newImages = files.slice(0, 50 - chapterImages.length); // Limit the selection to remaining slots

    // Generate preview URLs for the newly added images
    const newImagePreviews: FilePreview[] = newImages.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setChapterImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);

    // Reset file input after upload to ensure proper behavior when re-uploading
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newChapterImages = [...chapterImages];
    const newImagePreviews = [...imagePreviews];

    newChapterImages.splice(index, 1); // Remove image at index
    URL.revokeObjectURL(imagePreviews[index].url); // Revoke object URL to avoid memory leaks
    newImagePreviews.splice(index, 1); // Remove corresponding preview

    setChapterImages(newChapterImages);
    setImagePreviews(newImagePreviews);

    // Reset file input to allow re-uploading files
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearAllImages = () => {
    // Revoke all object URLs to avoid memory leaks
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));

    setChapterImages([]);
    setImagePreviews([]);
    setError(""); // Clear any existing errors

    // Reset file input after clearing all images
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();

    if (draggingIndex === null) return;

    const draggedImage = chapterImages[draggingIndex];
    const draggedPreview = imagePreviews[draggingIndex];

    const newChapterImages = [...chapterImages];
    const newImagePreviews = [...imagePreviews];

    // Remove the dragged item from its original position
    newChapterImages.splice(draggingIndex, 1);
    newImagePreviews.splice(draggingIndex, 1);

    // Insert the dragged item into the new position
    newChapterImages.splice(index, 0, draggedImage);
    newImagePreviews.splice(index, 0, draggedPreview);

    setChapterImages(newChapterImages);
    setImagePreviews(newImagePreviews);
    setDraggingIndex(index); // Update the dragging index
  };

  const handleDragEnd = () => {
    setDraggingIndex(null); // Reset the dragging index
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!chapterName.trim()) {
      setError("Chapter name is required");
      return;
    }

    if (priceType === 'coin' && (coinPrice <= 0 || coinPrice > 999)) {
      setError("Please enter a valid coin price (1-999)");
      return;
    }

    if (chapterImages.length === 0) {
      setIsErrorDialogOpen(true);
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  // Handle finishing after confirmation
  const handleFinish = async () => {
    try {
      const formData = new FormData();
      formData.append('chapterName', chapterName);
      formData.append('priceType', priceType);
      if (priceType === 'coin') {
        formData.append('price', coinPrice.toString());
      } else if (priceType === 'free') {
        formData.append('price', '0');
      }
      
      chapterImages.forEach((image) => {
        formData.append('imageChapterFiles', image);
      });

      const response = await fetch(`/api/story/${mangaId}/chapter`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create chapter');
      }

      // const data = await response.json();
      
      // Show success toast
      toast({
        title: "Success!",
        description: "Chapter created successfully",
        variant: "default",
        duration: 3000,
      });

      router.push(`/manga/${mangaId}`);
    } catch (error) {
      setError('Failed to create chapter. Please try again.');
      setIsConfirmDialogOpen(false);
      console.error('Error creating chapter:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to create chapter. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Chapter</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chapter Name Input */}
          <Card className={`${
            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-900'
          }`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chapterName" className="text-lg font-semibold mb-2">
                    Chapter Name
                  </Label>
                  <Input
                    id="chapterName"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="Enter chapter name"
                    className={`mt-1 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  />
                </div>

                {/* Price Selection */}
                <div className="mt-6">
                  <Label className="text-lg font-semibold mb-4">
                    Price Setting
                  </Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        value="free" 
                        id="free" 
                        name="price-type" 
                        checked={priceType === 'free'}
                        onChange={(e) => setPriceType(e.target.value as 'free' | 'coin')}
                        className="h-4 w-4" 
                      />
                      <Label htmlFor="free" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        Free Chapter
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <input 
                        type="radio" 
                        value="coin" 
                        id="coin" 
                        name="price-type"
                        checked={priceType === 'coin'}
                        onChange={(e) => setPriceType(e.target.value as 'free' | 'coin')}
                        className="h-4 w-4" 
                      />
                      <Label htmlFor="coin" className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        Paid Chapter
                      </Label>
                    </div>
                  </div>

                  {priceType === 'coin' && (
                    <div className="mt-4">
                      <Label htmlFor="coinPrice">Coin Price</Label>
                      <Input
                        id="coinPrice"
                        type="number"
                        min="1"
                        max="999"
                        value={coinPrice}
                        onChange={(e) => setCoinPrice(Number(e.target.value))}
                        className={`mt-1 w-32 ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white text-gray-900'
                        }`}
                      />
                      <p className={`text-sm mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Enter price between 1-999 coins
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Section */}
          <Card className={`${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardContent className="p-6">
              <Label htmlFor="images" className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Upload Chapter Images (Max 50)
              </Label>
              <Input
                ref={fileInputRef}
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={`mt-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white text-gray-900'
                }`}
              />
              <p className={`text-sm mt-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Images uploaded: {chapterImages.length} / 50
              </p>
            </CardContent>
          </Card>

          {/* Toggle buttons for "Preview" and "Name" view modes */}
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                viewMode === 'preview'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
            >
              <span>🖼️</span> {/* Icon for preview */}
              View by Preview
            </button>

            <button
              type="button"
              onClick={() => setViewMode('name')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                viewMode === 'name'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
            >
              <span>📄</span> {/* Icon for name */}
              View by Name
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {imagePreviews.length > 0 && (
            <div className="flex flex-col space-y-4 mt-4">
              {viewMode === 'preview' && (
                imagePreviews.map((image, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 w-96 h-[50vh]"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <Image
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <p className="text-sm text-center mt-2">{image.name}</p> {/* Display file name */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}

              {viewMode === 'name' && (
                imagePreviews.map((image, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <p className="text-sm">{image.name}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-600 text-white px-2 py-1 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {chapterImages.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleClearAllImages}
                className="bg-red-600 text-white px-4 py-2"
              >
                Clear All Images
              </button>
            </div>
          )}

          {/* Finish Button */}
          <div className="mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Finish
            </button>
          </div>

          {/* Go Back Button */}
          <div className="mt-4">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => router.back()} // Go back to the previous page
            >
              Go Back
            </button>
          </div>

          {/* Confirmation Dialog for Finish */}
          <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <AlertDialogContent className={
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }>
              <AlertDialogHeader>
                <AlertDialogTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Confirm Chapter Creation
                </AlertDialogTitle>
                <AlertDialogDescription className={
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }>
                  Chapter Name: {chapterName}<br />
                  Price: {priceType === 'free' ? 'Free' : `${coinPrice} coins`}<br />
                  Images: {chapterImages.length}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleFinish}>Create Chapter</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Error Dialog for No Images */}
          <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>No Images Uploaded</AlertDialogTitle>
                <AlertDialogDescription>
                  You need to upload at least one image before finishing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsErrorDialogOpen(false)}>Go Back to Edit</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </form>
      </div>
    </div>
  );
}
