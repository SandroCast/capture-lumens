
import React from 'react';
import { Camera, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Camera className="h-6 w-6" />
            <span className="text-lg font-medium">Capture Lumens</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            <a 
              href="https://github.com/yourusername/capture-lumens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors"
            >
              GitHub
            </a>
          </div>
          
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
