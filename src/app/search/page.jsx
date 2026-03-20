"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Search() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (searchQuery = null) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: searchTerm.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Ensure Users & Posts Exists Or Not
        const user = Array.isArray(data.users) ? data.users : [];
        const post = Array.isArray(data.posts) ? data.posts : [];

        setResults({ users: user, posts: post });
        setMessage(
          user.length || post.length ? "" : "No Result Found"
        );
      } else {
        setMessage(data.error || data.message || "Error While Searching");
      }
    } catch (error) {
      setMessage("Failed To Fetch Data");
      console.error("Search error:", error);
    }
    setLoading(false);
  };

  // Read query parameter from URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
      // Auto-search if query exists in URL
      handleSearch(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen relative">
      {/* Blurred Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
      
      <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-black">Search</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Search By UserName Or Post Content"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
            />
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
            <p className="text-black">Loading...</p>
          </div>
        )}
        {message && (
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
            <p className="text-black">{message}</p>
          </div>
        )}
      {results.users.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-black">Users</h2>
          <div className="space-y-3">
            {results.users.map((user) => (
              <Link
                key={user._id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
              >
                {user.profile_picture ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={user.profile_picture}
                      alt={user.username}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-black">{user.username}</p>
                  {user.full_name && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {user.full_name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {results.posts.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Posts</h2>
          <div className="space-y-4">
            {results.posts.map((post) => (
              <div
                key={post._id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-black">
                    {post.author?.username || "Unknown"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {post.caption && (
                  <p className="mb-2 text-black">{post.caption}</p>
                )}
                {post.media?.url && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={post.media.url}
                      alt={post.caption || "Post"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm text-blue-600 dark:text-blue-400 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
