
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Video, Github, Twitter } from "lucide-react";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Navigation Bar */}
      <nav className="w-full p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm z-10 fixed">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Camera className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">LumenCapture</h1>
          </div>
          <div className="flex space-x-2">
            <Link to="/detector">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
                LED Detector
              </Button>
            </Link>
            <Link to="/time-lapse">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
                Time-Lapse
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Capture Light, Create Magic
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Advanced tools for LED detection and stunning time-lapse creation, all in one place.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-105">
              <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">LED Detector</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Automatically detect and capture images when LEDs illuminate in your field of view.
              </p>
              <Link to="/detector">
                <Button className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Detecting
                </Button>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-105">
              <Video className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Time-Lapse Creator</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Transform your image sequences into stunning time-lapse videos with professional controls.
              </p>
              <Link to="/time-lapse">
                <Button className="w-full">
                  <Video className="mr-2 h-4 w-4" />
                  Create Time-Lapse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="mt-10 py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Detect & Capture</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Set up your camera to automatically detect LED lights and capture images when they turn on.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Organize Images</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Review, sort, and prepare your captured images for the time-lapse creation process.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Create Time-Lapse</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Convert your image sequence into a smooth time-lapse video with customizable settings.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">LumenCapture</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                © {new Date().getFullYear()} LumenCapture. All rights reserved.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-4 mb-2">
                <a href="#" className="text-gray-500 hover:text-primary">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Privacy Policy | Terms of Service
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
