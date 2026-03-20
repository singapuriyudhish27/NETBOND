"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Post() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    author: "",
    caption: "",
    media: { url: "", type: "image" },
    tags: [],
    location: "",
  });
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  // Set author to current user's username on mount
  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({
        ...prev,
        author: user.username,
      }));
    }
  }, [user?.username]);



  //Create New Post
  const createPost = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!file) {
        console.warn("No File Selected");
        alert("Please select a media file");
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("caption", formData.caption || "");
      // API expects tags as comma-separated string, not JSON
      form.append("tags", formData.tags.join(",") || "");
      form.append("location", formData.location || "");
      form.append("mediaType", formData.media.type || "image");
      form.append("media", file);

      const response = await fetch("/api/posts/new", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form on success
        setFormData({
          author: user?.username || "",
          caption: "",
          media: { url: "", type: "image" },
          tags: [],
          location: "",
        });
        setFile(null);
        alert("Post created successfully!");
      } else {
        console.error("Error Creating Post", data);
        alert(data.error || data.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error Creating Post", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative">
      {/* Blurred Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
      
      <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
        <div className="bg-grey/80 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-white">Create New Post</h1>
          <form onSubmit={createPost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white-700 mb-1">Author Username</label>
              <input
                type="text"
                placeholder="Author username"
                value={formData.author || user?.username || ""}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value.trim() })
                }
                required
                disabled={!!user?.username}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white-700 mb-1">Caption</label>
              <textarea
                placeholder="Caption"
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white-700 mb-1">Media</label>
              <input
                type="file"
                name="media"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white-700 mb-1">Media Type</label>
              <select
                value={formData.media.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    media: { ...formData.media, type: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Tags"
                value={formData.tags.join(",")}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value.split(",") })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Create Post"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
