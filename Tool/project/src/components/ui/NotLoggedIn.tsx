import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export function NotLoggedIn() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
      <div className="max-w-md w-full">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {/* Main card */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 text-center transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          {/* Icon container */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform transition-transform duration-300 hover:rotate-6">
            <Lock className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
              Access Restricted
            </h2>
            
            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
              You need to be logged in to access this area. Please authenticate to continue to your dashboard.
            </p>
          </div>

          {/* Button */}
          <div className="mt-8">
            <Button 
              onClick={() => navigate('/login')} 
              variant="primary"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/25"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80"></div>
          <div className="absolute -bottom-1 -left-2 w-3 h-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-60"></div>
        </div>

        {/* Additional context */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            New here? Contact your administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}