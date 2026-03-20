import React from 'react';
import Image from 'next/image';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  const defaultImage = 'https://example.com/default-profile.png';

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      {src ? (
        <Image 
          src={src} 
          alt={alt || 'User avatar'} 
          fill 
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
          {alt ? alt.charAt(0).toUpperCase() : 'U'}
        </div>
      )}
    </div>
  );
};

export default Avatar;