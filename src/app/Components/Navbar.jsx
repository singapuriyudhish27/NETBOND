"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim();
      if (!query) return;

      // Redirect to search page with query parameter
      // The search page will handle the API call
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-gray-900/60 border-b border-gray-200/60 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">NETBOND</Link>

          <div className="flex-1 flex items-center">
            <div className="w-full max-w-md mx-auto hidden md:block">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd"/></svg>
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm outline-none focus:ring-2 ring-blue-500/60"
                  placeholder="Search NETBOND"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                <Link href="/" className="hidden sm:inline text-gray-700 dark:text-gray-300 hover:text-blue-600">Home</Link>
                <Link href="/posts" className="hidden sm:inline text-gray-700 dark:text-gray-300 hover:text-blue-600">Posts</Link>
                <Link href="/notification" className="text-gray-700 dark:text-gray-300 hover:text-blue-600" aria-label="Notifications">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10V7a2 2 0 10-4 0v3M5 10h14l-1 9H6l-1-9z"/></svg>
                </Link>
                <Link href="/message" className="text-gray-700 dark:text-gray-300 hover:text-blue-600" aria-label="Messages">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h6m-9 8l4-4h10a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v14z"/></svg>
                </Link>
                <Link href="/profile" className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm px-3 py-1.5 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Login</Link>
                <Link href="/register" className="text-sm px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-500">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;