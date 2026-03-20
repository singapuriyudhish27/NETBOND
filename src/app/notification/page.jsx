"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Notification() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  //Fetch All Notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await fetch("/api/notification", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      const data = await response.json();
      // console.log("Notifications",data);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error Fetching Notification", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  //Mark AS Read
  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notification/mark/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error Marking As Read", error);
    }
  };

  //Delete Notification
  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notification/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error Deleting Notification", error);
    }
  };

  // Get notification message based on type
  const getNotificationMessage = (notification) => {
    const senderName = notification.sender?.username || "Someone";
    
    switch (notification.type) {
      case "like":
        return `${senderName} liked your post`;
      case "comment":
        return `${senderName} commented on your post`;
      case "following":
        return `${senderName} started following you`;
      case "unfollowing":
        return `${senderName} unfollowed you`;
      case "mention":
        return `${senderName} mentioned you in a post`;
      case "message":
        return `${senderName} sent you a message`;
      case "share":
        return `${senderName} shared your post`;
      case "story":
        return `${senderName} posted a story`;
      default:
        return `${senderName} interacted with you`;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case "comment":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "following":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case "story":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
        <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6">
            <p className="text-black">Loading Notifications ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Blurred Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
      
      <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-black">Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6">
            <p className="text-black text-center">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 transition-all ${
                  !notif.isRead ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Sender Avatar */}
                  <Link href={`/profile/${notif.sender?.username || notif.sender?._id || notif.sender}`}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 overflow-hidden border-2 border-gray-200">
                      {notif.sender?.profile_picture ? (
                        <Image
                          src={notif.sender.profile_picture}
                          alt={notif.sender?.username || "User"}
                          width={48}
                          height={48}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {notif.sender?.username?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Notification Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getNotificationIcon(notif.type)}
                          <p className="text-black font-semibold">
                            {getNotificationMessage(notif)}
                          </p>
                        </div>

                        {notif.comment && (
                          <div className="mb-2 text-black bg-gray-100 p-2 rounded">
                            <span className="text-gray-600 text-sm">Comment: </span>
                            {notif.comment}
                          </div>
                        )}

                        {notif.post && (
                          <div className="mb-2">
                            {notif.post.media?.url && (
                              <div className="w-20 h-20 relative rounded overflow-hidden mb-2">
                                <Image
                                  src={notif.post.media.url}
                                  alt="Post"
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            )}
                            {notif.post.caption && (
                              <p className="text-black text-sm line-clamp-2">
                                {notif.post.caption}
                              </p>
                            )}
                          </div>
                        )}

                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {!notif.isRead && (
                          <button 
                            onClick={() => markAsRead(notif._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notif._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
