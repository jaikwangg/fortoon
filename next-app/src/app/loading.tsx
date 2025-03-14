'use client'
import React from 'react';
import Image from 'next/image';
import { useSettings } from "@/contexts/SettingsContext";

const GlobalLoading = () => {
  const { theme } = useSettings();

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      bg-black/50 backdrop-blur-sm transition-all
    `}>
      <div className={`
        rounded-lg p-6 flex flex-col items-center gap-4
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        <Image 
          src={theme === 'dark' ? "/dark-loading.gif" : "/light-loading.gif"}
          alt="Loading..."
          width={100}
          height={100}
          priority
        />
      </div>
    </div>
  );
};

export default GlobalLoading;