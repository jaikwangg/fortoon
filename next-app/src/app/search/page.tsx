'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CldImage } from "next-cloudinary";
import { Manga } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [stories, setStories] = useState<Manga[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/story', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }

        const data = await response.json();
        const filteredStories = data.data.filter((manga: Manga) =>
          manga.title.toLowerCase().includes(query.toLowerCase())
        );
        setStories(filteredStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        toast({
          title: "Error",
          description: "Failed to fetch stories",
          variant: "destructive",
        });
      }
    };

    if (query) {
      fetchStories();
    } else {
      setStories([]);
    }
  }, [query, toast]);

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Search Stories</h1>
        <p className="text-muted-foreground">Enter a search term to find stories.</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Search Results for &ldquo;{query}&rdquo;</h1>
        <p className="text-muted-foreground">No stories found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for &ldquo;{query}&rdquo;</h1>
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {stories.map((manga, index) => (
          <motion.div
            key={manga.sId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link 
              href={`/manga/${manga.sId}`}
              className="group hover:opacity-80 transition-opacity block"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-muted">
                <CldImage
                  src={manga.coverImageUrl}
                  alt={manga.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  priority={index < 4}
                />
              </div>
              <h2 className="font-medium line-clamp-2">{manga.title}</h2>
              <p className="text-sm text-muted-foreground">{manga.authorDisplayName}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 