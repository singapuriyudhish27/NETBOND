"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import Stories from "./Components/Stories";
import CreatePost from "./Components/CreatePost";
import Sidebar from "./Components/Sidebar";
import Suggestions from "./Components/Suggestions";
import PostCard from "./Components/PostCard";

const sampleStories = new Array(12).fill(0).map((_, i) => ({
  label: `User ${i + 1}`,
  href: "/profile",
}));

const Home = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated()) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  //Get All Posts
  const fetchAllPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts/all", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error Fetching Posts", error.message);
    }
  }, []);

  //Toggle Like
  const likeToggle = async (postId) => {
    try {
      const response = await fetch(`/api/like/${postId}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        const updatedPosts = posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: data.liked
                  ? [...(post.likes || []), currentUserId]
                  : (post.likes || []).filter((id) => id.toString() !== currentUserId.toString()),
                likesCount: data.likesCount,
              }
            : post
        );
        setPosts(updatedPosts);
      }
    } catch (error) {
      console.error("Error Like", error.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchAllPosts();
      // Get current user ID
      const storedUsername = localStorage.getItem("username");
      setCurrentUserId(storedUsername || user?.username || "");
    }
  }, [isAuthenticated, fetchAllPosts, user?.username]);

  const handleCreate = async () => {
    // Refresh posts after creating
    await fetchAllPosts();
  };

  // Show loading state or nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Don't render home if not authenticated (will redirect)
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)_20rem] gap-6">
      <Sidebar />
      <div className="space-y-6">
        <Stories items={sampleStories} />
        <CreatePost onCreate={handleCreate} />
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No posts yet. Create your first post!</p>
            </div>
          )}
        </div>
      </div>
      <Suggestions users={posts && posts.length > 0 ? posts.slice(0, 5).map(p => ({ 
        _id: p._id, 
        username: p.author?.username || p.author || "unknown", 
        mutuals: (parseInt(p._id?.slice(-1) || "0") % 3) + 1 
      })) : []} />
    </section>
  );
};

export default Home;
