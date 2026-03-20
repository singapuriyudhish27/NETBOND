"use client";

import React from "react";

const message = () => {
  return (
    <div className="min-h-screen relative">
      {/* Blurred Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"></div>
      
      <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-black">Welcome To Chats</h1>
        </div>
      </div>
    </div>
  );
};

export default message;
