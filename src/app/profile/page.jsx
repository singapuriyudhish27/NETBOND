"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function HandleProfile() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    website: "",
    location: "",
    gender: "",
    privacy: "",
    profile_picture: null,
  });
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({ caption: "", tags: "", location: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const data = new FormData();
      
      // Use authenticated user's username if available, otherwise use form data
      const username = user?.username || formData.username;
      
      data.append("username", username);
      data.append("full_name", formData.full_name);
      data.append("bio", formData.bio || "");
      data.append("website", formData.website || "");
      data.append("location", formData.location);
      data.append("gender", formData.gender || "other");
      
      // Handle privacy - convert to JSON string if it's an object
      if (formData.privacy) {
        const privacyValue = typeof formData.privacy === 'string' 
          ? formData.privacy 
          : JSON.stringify(formData.privacy);
        data.append("privacy", privacyValue);
      }
      
      if (formData.profile_picture) {
        data.append("profile_picture", formData.profile_picture);
      }

      // Use PUT for updates, POST for new profiles
      const method = userData ? "PUT" : "POST";
      
      const response = await fetch("/api/profile", {
        method: method,
        credentials: "include",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(userData ? "Profile Updated Successfully!" : "Profile Created Successfully!");
        setIsEditing(false); // Close form after successful save
        // Refresh profile data
        await fetchUserData();
      } else {
        setError(result.message || result.error || (userData ? "Error Updating Profile" : "Error Creating Profile"));
      }
    } catch (error) {
      console.error("Submit Error", error);
      setError(userData ? "Failed to update profile. Please try again." : "Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.profile) {
        setUserData(data.profile);
        // Posts will be fetched separately via fetchAllPosts
        // setPosts(data.posts || []);
        // Pre-fill form with existing profile data
        setFormData({
          username: data.profile.username || "",
          full_name: data.profile.full_name || "",
          bio: data.profile.bio || "",
          website: data.profile.website || "",
          location: data.profile.location || "",
          gender: data.profile.gender || "other",
          privacy: data.profile.privacy?.profileVisibility || "public",
          profile_picture: null,
        });
      }
    } catch (error) {
      console.error("Error Fetching Data", error);
    }
  }, []);

  //Get All Posts - Filter to show only current user's posts
  const fetchAllPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts/all", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && userData) {
        // Filter posts to only show current user's posts
        const userPosts = data.filter(
          (post) => post.author?._id?.toString() === userData._id?.toString() ||
                     post.author?.toString() === userData._id?.toString()
        );
        setPosts(userPosts);
      }
    } catch (error) {
      console.error("Error Fetching Posts", error.message);
    }
  }, [userData]);

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

  // Edit Post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditFormData({
      caption: post.caption || "",
      tags: post.tags?.join(", ") || "",
      location: post.location || "",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const tagsArray = editFormData.tags
        ? editFormData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
        : [];

      const response = await fetch(`/api/posts/edit/${editingPost._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          caption: editFormData.caption,
          tags: tagsArray,
          location: editFormData.location,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Post updated successfully!");
        setEditingPost(null);
        setEditFormData({ caption: "", tags: "", location: "" });
        // Refresh posts
        await fetchAllPosts();
      } else {
        setError(data.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Failed to update post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setError("");
    setSuccess("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/delete/${postId}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Post deleted successfully!");
        // Remove post from local state
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      } else {
        setError(data.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if post belongs to current user
  const isOwnPost = (post) => {
    if (!userData || !post) return false;
    return (
      post.author?._id?.toString() === userData._id?.toString() ||
      post.author?.toString() === userData._id?.toString()
    );
  };

  // Load existing profile data on mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated() && user?.username) {
      fetchUserData();
      // Get current user ID
      const storedUsername = localStorage.getItem("username");
      setCurrentUserId(storedUsername || user?.username || "");
    }
  }, [isAuthenticated, user?.username, fetchUserData]);

  // Fetch posts after userData is loaded
  useEffect(() => {
    if (userData?._id) {
      fetchAllPosts();
    }
  }, [userData?._id, fetchAllPosts]);

  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Please login to view your profile</div>
      </div>
    );
  }

  // Show form only if editing or no profile exists
  const showForm = isEditing || !userData;

  return (
    <div className="min-h-screen relative">
      {/* Blurred Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
      
      <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded backdrop-blur-sm bg-opacity-90">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded backdrop-blur-sm bg-opacity-90">
            {success}
          </div>
        )}

      {showForm ? (
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">
            {userData ? "Edit Profile" : "Create Profile"}
          </h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={user?.username || formData.username}
            onChange={handleChange}
            required
            disabled={!!user?.username}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="text"
            name="website"
            placeholder="Website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select 
            name="gender" 
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Picture
          </label>
          <input
            type="file"
            name="profile_picture"
            onChange={handleChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Privacy
          </label>
          <select 
            name="privacy" 
            value={formData.privacy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        
            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : userData ? "Update Profile" : "Create Profile"}
              </button>
              {userData && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                    setSuccess("");
                    fetchUserData();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        // Profile View (Read-only)
        userData && (
          <div className="relative">
            {/* Blurred Background for Profile View */}
            <div className="absolute -inset-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-[180px] opacity-35 rounded-3xl -z-10"></div>
            
            {/* Profile Header Section */}
            <div className="relative bg-white/80 backdrop-blur-md rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  {userData.profile_picture ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                      <Image 
                        src={userData.profile_picture} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                      <span className="text-4xl text-gray-600 font-bold">
                        {userData.full_name?.charAt(0)?.toUpperCase() || userData.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold mb-1 text-black">
                      {userData.full_name || "None"}
                    </h3>
                    <p className="text-black">@{userData.username || "None"}</p>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-black">Bio: </span>
                  <span className="text-black">{userData.bio || "None"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-black">Website: </span>
                    {userData.website ? (
                      <a 
                        href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:underline"
                      >
                        {userData.website}
                      </a>
                    ) : (
                      <span className="text-black">None</span>
                    )}
                  </div>

                  <div>
                    <span className="font-semibold text-black">Location: </span>
                    <span className="text-black">{userData.location || "None"}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-black">Gender: </span>
                    <span className="text-black capitalize">{userData.gender || "None"}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-black">Privacy: </span>
                    <span className="text-black capitalize">
                      {userData.privacy?.profileVisibility || "public"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Posts */}
            {posts && posts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-black">My Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => {
                    const isLiked = post.likes?.some(
                      (likeId) => likeId.toString() === currentUserId.toString()
                    ) || false;
                    const ownPost = isOwnPost(post);
                    return (
                      <div key={post._id} className="bg-white/80 backdrop-blur-md rounded-lg shadow-md overflow-hidden relative">
                        {/* Edit/Delete buttons - only show for own posts */}
                        {ownPost && (
                          <div className="absolute top-2 right-2 flex gap-2 z-10">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg"
                              title="Edit Post"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              disabled={isDeleting}
                              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg disabled:opacity-50"
                              title="Delete Post"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {post.media?.url && (
                          <div className="w-full h-48 relative overflow-hidden">
                            <Image 
                              src={post.media.url} 
                              alt="Post" 
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="p-4">
                          {post.caption && (
                            <p className="text-black mb-2 line-clamp-2">{post.caption}</p>
                          )}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {post.tags.map((tag, index) => (
                                <span key={index} className="text-blue-600 text-xs">#{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm text-black mb-2">
                            <span>{post.likes?.length || post.likesCount || 0} likes</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <button 
                            onClick={() => likeToggle(post._id)}
                            className={`w-full px-3 py-1 rounded-md text-sm ${
                              isLiked 
                                ? "bg-red-500 text-white hover:bg-red-600" 
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            {isLiked ? "Liked" : "Like"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Edit Post</h2>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setEditFormData({ caption: "", tags: "", location: "" });
                    setError("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {editingPost.media?.url && (
                <div className="mb-4 w-full h-64 relative rounded-lg overflow-hidden">
                  <Image
                    src={editingPost.media.url}
                    alt="Post media"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}

              <form onSubmit={handleUpdatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <textarea
                    name="caption"
                    value={editFormData.caption}
                    onChange={handleEditFormChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a caption..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={editFormData.tags}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Location"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Updating..." : "Update Post"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPost(null);
                      setEditFormData({ caption: "", tags: "", location: "" });
                      setError("");
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
