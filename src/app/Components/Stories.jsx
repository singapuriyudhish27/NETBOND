"use client";

import React from 'react';
import Link from 'next/link';

const StoryAvatar = ({ label = 'You', href = '#', imageUrl }) => {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-0.5">
        <span className="h-full w-full rounded-full bg-white p-0.5 dark:bg-gray-900">
          <span className="block h-full w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden" style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </span>
      </span>
      <span className="text-xs text-gray-700 dark:text-gray-300 max-w-16 truncate">{label}</span>
    </Link>
  );
};

const Stories = ({ items = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
        {items.map((story, idx) => (
          <StoryAvatar key={idx} label={story.label} href={story.href} imageUrl={story.imageUrl} />
        ))}
      </div>
    </div>
  );
};

export default Stories;

