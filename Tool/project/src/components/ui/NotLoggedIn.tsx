import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export function NotLoggedIn() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">You are not logged in</h2>
      <p className="text-sm text-gray-500 mb-6">Please log in to continue and access your dashboard.</p>
      <Button onClick={() => navigate('/login')} variant="primary">
        Go to Login
      </Button>
    </div>
  );
}
