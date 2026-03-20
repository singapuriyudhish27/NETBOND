"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const CreatePost = ({ onCreate }) => {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !media) return;
    try {
      setIsSubmitting(true);
      await onCreate?.({ text, media });
      setText("");
      setMedia(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <Link href="/profile" className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">U</Link>
        <div className="flex-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-500/60"
          />
          <div className="mt-3 flex items-center justify-between">
            <label className="text-sm text-blue-600 cursor-pointer hover:underline">
              <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setMedia(e.target.files?.[0] || null)} />
              Add photo/video
            </label>
            <button disabled={isSubmitting || (!text && !media)} className="text-sm px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50">
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;

