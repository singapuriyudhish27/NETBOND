"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const userId = params?.userId;
  
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`/api/profile/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(data.profile);
        setPosts(data.posts || []);
      } else {
        setError(data.message || data.error || "Profile not found");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
        <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 text-center">
            <p className="text-black">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
        <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              href="/"
              className="text-blue-600 hover:underline"
            >
              Go back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Blurred Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
      
      <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
        {/* Profile Header Section */}
        <div className="relative bg-white/80 backdrop-blur-md rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              {profileData.profile_picture ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  <Image 
                    src={profileData.profile_picture} 
                    alt="Profile" 
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                  <span className="text-4xl text-gray-600 font-bold">
                    {profileData.full_name?.charAt(0)?.toUpperCase() || profileData.username?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold mb-1 text-black">
                  {profileData.full_name || "None"}
                </h3>
                <p className="text-black">@{profileData.username || "None"}</p>
              </div>
            </div>

            {/* Back Button */}
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-lg"
            >
              Back
            </Link>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-black">Bio: </span>
              <span className="text-black">{profileData.bio || "None"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-black">Website: </span>
                {profileData.website ? (
                  <a 
                    href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:underline"
                  >
                    {profileData.website}
                  </a>
                ) : (
                  <span className="text-black">None</span>
                )}
              </div>

              <div>
                <span className="font-semibold text-black">Location: </span>
                <span className="text-black">{profileData.location || "None"}</span>
              </div>

              <div>
                <span className="font-semibold text-black">Gender: </span>
                <span className="text-black capitalize">{profileData.gender || "None"}</span>
              </div>

              <div>
                <span className="font-semibold text-black">Privacy: </span>
                <span className="text-black capitalize">
                  {profileData.privacy?.profileVisibility || "public"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        {posts && posts.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-black">Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post._id} className="bg-white/60 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-200">
                  {post.media?.url && (
                    <div className="w-full h-48 relative overflow-hidden">
                      {post.media.type === "image" ? (
                        <Image 
                          src={post.media.url} 
                          alt="Post" 
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <video 
                          src={post.media.url} 
                          controls 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    {post.caption && (
                      <p className="text-black mb-2 line-clamp-2">{post.caption}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-black">
                      <span>{post.likes?.length || 0} likes</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!posts || posts.length === 0) && (
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-md p-8 text-center text-black">
            <p>No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

