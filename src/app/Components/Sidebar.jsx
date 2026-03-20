"use client";

import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const items = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/posts', label: 'New Post' },
    { href: '/notification', label: 'Notifications' },
    { href: '/message', label: 'Messages' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 space-y-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;

