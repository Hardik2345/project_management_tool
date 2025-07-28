import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { handleApiResponse, handleApiError } from '../lib/api';
import { Button } from '../components/ui/Button';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const response = await api.patch(`/users/resetPassword/${token}`, {
        password,
        passwordConfirm,
      });
      handleApiResponse(response);
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errInfo = handleApiError(err);
      setError(errInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        {message && <div className="bg-green-100 text-green-700 p-2 rounded text-center">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-center">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  );
}
