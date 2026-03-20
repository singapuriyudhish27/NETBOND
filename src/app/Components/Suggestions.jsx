"use client";

import React from 'react';
import Link from 'next/link';

const SuggestionItem = ({ user }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-sm">{user.username?.[0]?.toUpperCase() || 'U'}</span>
        <div>
          <p className="text-sm font-medium">{user.username || 'user'}</p>
          <p className="text-xs text-gray-500">{user.mutuals || 0} mutuals</p>
        </div>
      </div>
      <Link href={`/profile/${user._id || ''}`} className="text-xs px-3 py-1.5 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90">View</Link>
    </div>
  );
};

const Suggestions = ({ users = [] }) => {
  return (
    <aside className="hidden xl:block w-80 shrink-0">
      <div className="sticky top-20 space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold mb-3">Who to follow</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((u, i) => (
              <SuggestionItem key={i} user={u} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Suggestions;

