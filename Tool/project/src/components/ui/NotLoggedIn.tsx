import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from './Button';

export function NotLoggedIn() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
      <div className="max-w-md w-full">
        {/* Main card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          {/* Icon container */}
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-gray-600" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Access Restricted
            </h2>
            
            <p className="text-gray-600 max-w-sm mx-auto">
              Please log in to continue and access your dashboard.
            </p>
          </div>

          {/* Button */}
          <div className="mt-8">
            <Button 
              onClick={() => navigate('/login')} 
              variant="primary"
            >
              Go to Login
            </Button>
          </div>
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