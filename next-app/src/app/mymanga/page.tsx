'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Clock, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { Manga } from '@/lib/types';
import { CldImage } from "next-cloudinary";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function MangaDashboard() {
  // const router = useRouter();
  const [purchased, setPurchased] = useState<Manga[]>([]);
  const { theme } = useSettings();

  useEffect(() => {
    const fetchPurchasedManga = async () => {
      try {
        const response = await fetch('/api/story/purchased');
        if (!response.ok) throw new Error('Failed to fetch purchased manga');
        const data = await response.json();
        setPurchased(data.data || []);
      } catch (error) {
        console.error('Error fetching purchased manga:', error);
      }
    };

    fetchPurchasedManga();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const MangaCard = ({ manga }: { manga: Manga }) => {
    const router = useRouter();
    const { theme } = useSettings();

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className={`w-full h-full cursor-pointer hover:shadow-lg transition-all ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col h-full space-y-4">
              {/* Cover Image */}
              {manga.coverImageUrl && (
                <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden">
                  <CldImage
                    width={400}
                    height={600}
                    src={manga.coverImageUrl}
                    alt={manga.title}
                    className="object-cover"
                    onClick={() => router.push(`/manga/${manga.sId}`)}
                  />
                </div>
              )}

              {/* Title */}
              <h3 
                className={`font-semibold text-lg truncate cursor-pointer ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
                onClick={() => router.push(`/manga/${manga.sId}`)}
              >
                {manga.title}
              </h3>

              {/* Author */}
              <Link 
                href={`/profile/${manga.authorId}`}
                className={`flex items-center text-sm hover:text-blue-500 transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <User className="w-4 h-4 mr-2" />
                {manga.authorDisplayName}
              </Link>

              {/* Metadata */}
              <div className="space-y-2">
                {/* Rating */}
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {manga.rating?.toFixed(1) || "N/A"} / 5.0
                </div>

                {/* Posted Date */}
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDate(manga.postedDatetime)}
                </div>

                {/* Introduction Preview */}
                <div className="text-sm text-gray-500 line-clamp-2">
                  <BookOpen className="inline w-4 h-4 mr-2" />
                  {manga.introduction}
                </div>
              </div>

              {/* Continue Reading Button */}
              <Button 
                className={`w-full mt-auto ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                onClick={() => {
                  const firstAccessibleChapter = manga.chapters?.find(chapter => 
                    chapter.price === 0 || (chapter.images && chapter.images.length > 0)
                  );
                  
                  if (firstAccessibleChapter) {
                    router.push(`/manga/${manga.sId}/chapter/${firstAccessibleChapter.cId}`);
                  } else {
                    router.push(`/manga/${manga.sId}`);
                  }
                }}
              >
                Continue Reading
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className={`min-h-screen w-full px-4 py-8 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          variants={itemVariants}
          className={`text-2xl md:text-3xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          My Manga Collection
        </motion.h1>

        {purchased.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {purchased.map((manga) => (
              <MangaCard key={manga.sId} manga={manga} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants}
            className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            No purchased manga yet
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}