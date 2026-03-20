"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Card from './Card';
import Avatar from './Avatar';
import Button from './Button';

const PostCard = ({ post, onLike }) => {
  const [likes, setLikes] = useState(post.likes?.length || post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      // Toggle like status optimistically
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikes(newIsLiked ? likes + 1 : likes - 1);
      
      // Call API to update like status
      const response = await fetch(`/api/like/${post._id}`, {
        method: "POST",
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update with server response
        setIsLiked(data.liked);
        setLikes(data.likesCount);
        // If onLike callback is provided, call it (for parent component state update)
        if (onLike) {
          onLike();
        }
      } else {
        // Revert on error
        setIsLiked(isLiked);
        setLikes(likes);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert UI state if API call fails
      setIsLiked(isLiked);
      setLikes(likes);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="mb-6">
      <Card.Header className="flex items-center space-x-3">
        <Link href={`/profile/${post.author?._id || 'unknown'}`}>
          <Avatar 
            src={post.author?.profile_picture || null} 
            alt={post.author?.username || 'User'} 
            size="md" 
          />
        </Link>
        <div>
          <Link 
            href={`/profile/${post.author?._id || 'unknown'}`}
            className="font-semibold hover:underline"
          >
            {post.author?.username || 'Unknown User'}
          </Link>
          <p className="text-xs text-gray-500">
            {post.location && (
              <span className="mr-2">{post.location}</span>
            )}
            {post.createdAt && formatDate(post.createdAt)}
          </p>
        </div>
      </Card.Header>
      
      <div className="relative w-full aspect-square">
        {post.media?.type === 'image' && post.media?.url && (
          <Image 
            src={post.media.url} 
            alt={post.caption || 'Post image'} 
            fill
            className="object-cover"
          />
        )}
        {post.media?.type === 'video' && post.media?.url && (
          <video 
            src={post.media.url} 
            controls 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <Card.Body>
        <div className="flex items-center space-x-4 mb-3">
          <button 
            onClick={handleLike}
            className="flex items-center space-x-1 text-gray-700 hover:text-red-500"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <span>{likes}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-700 hover:text-blue-500"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
        
        {post.caption && (
          <p className="mb-2">
            <span className="font-semibold mr-2">{post.author?.username || 'Unknown'}:</span>
            {post.caption}
          </p>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-blue-600 text-sm hover:underline"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PostCard;