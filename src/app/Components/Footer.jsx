import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">NETBOND</h2>
            <p className="text-gray-400">Connect with friends and the world around you.</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="flex space-x-4">
              <a href="/" className="text-gray-400 hover:text-white">Home</a>
              <a href="/about" className="text-gray-400 hover:text-white">About</a>
              <a href="/privacy" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="/terms" className="text-gray-400 hover:text-white">Terms</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} NETBOND. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;