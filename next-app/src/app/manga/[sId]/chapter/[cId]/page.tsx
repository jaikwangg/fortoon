'use client'
import React, { useEffect, useState } from 'react';
import { useSettings } from "@/contexts/SettingsContext";
import { ChevronLeft, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CldImage } from 'next-cloudinary';

interface ChapterPageProps {
  params: {
    sId: string;
    cId: string;
  };
}

interface Image {
  imageSequenceNumber: number;
  url: string;
}

interface Chapter {
  name: string;
  cId: number;
  storyId: number;
  chapterSequence: number;
  price: number;
  images: Image[];
}

interface MangaData {
  sId: number;
  title: string;
  introduction: string;
  chapters: Chapter[];
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const { theme } = useSettings();
  const [mangaData, setMangaData] = useState<MangaData | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        const response = await fetch(`/api/story/${params.sId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch manga data');
        }
        const data = await response.json();
        setMangaData(data);
        
        const chapter = data.chapters.find(
          (ch: Chapter) => ch.cId.toString() === params.cId
        );
        if (chapter) {
          setCurrentChapter(chapter);
        } else {
          setError('Chapter not found');
        }
      } catch (err) {
        setError('Error loading manga data');
      }
    };

    fetchMangaData();
  }, [params.sId, params.cId]);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide navbar based on scroll direction
      if (currentScrollY > lastScrollY) {
        setShowNavbar(false); // Scrolling down
      } else {
        setShowNavbar(true); // Scrolling up
      }

      // Show/hide scroll-to-top button
      if (currentScrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error || !mangaData || !currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error || 'Failed to load content'}</p>
          <Link href={'mange/${params.sid}'} className="text-primary hover:underline mt-4 block">
            Return to Manga List
          </Link>
        </div>
      </div>
    );
  }

  // Find previous and next chapters
  const sortedChapters = [...mangaData.chapters].sort((a, b) => 
    a.chapterSequence - b.chapterSequence
  );
  const currentIndex = sortedChapters.findIndex(ch => ch.cId === currentChapter.cId);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Navbar with transition */}
      <nav className={`fixed top-0 left-0 right-0 bg-gray-800 text-white z-50 transition-transform duration-300 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={`/manga/${params.sId}`} className="flex items-center">
            <ChevronLeft className="w-6 h-6 mr-2" />
            <span>{mangaData.title}</span>
          </Link>
          <div className="flex items-center space-x-4">
            {prevChapter && (
              <Button variant="outline" asChild>
                <Link href={`/manga/${params.sId}/chapter/${prevChapter.cId}`}>
                  Previous Chapter
                </Link>
              </Button>
            )}
            {nextChapter && (
              <Button asChild>
                <Link href={`/manga/${params.sId}/chapter/${nextChapter.cId}`}>
                  Next Chapter
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Scroll to top button */}
      <Button
        variant="secondary"
        size="icon"
        className={`fixed bottom-4 right-4 rounded-full transition-opacity duration-300 z-50 ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={scrollToTop}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>

      <div className="container mx-auto px-4 pt-20 pb-8">
        <h1 className="text-2xl font-bold mb-4">
          Chapter {currentChapter.chapterSequence}
          {currentChapter.name && `: ${currentChapter.name}`}
        </h1>
        
        <div className="space-y-4">
          {currentChapter.images.length > 0 ? (
            currentChapter.images
              .sort((a, b) => a.imageSequenceNumber - b.imageSequenceNumber)
              .map((image) => (
                <CldImage 
                  key={image.imageSequenceNumber}
                  src={image.url}
                  alt={`Page ${image.imageSequenceNumber}`}
                  className="mx-auto w-full h-auto"
                  width={1200}
                  height={1800}
                  sizes="100vw"
                  priority={image.imageSequenceNumber === 1}
                />
              ))
          ) : (
            <div className="text-center py-8">
              <p>No images available for this chapter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}