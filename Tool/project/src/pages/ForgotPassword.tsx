import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { handleApiResponse, handleApiError } from '../lib/api';
import { Button } from '../components/ui/Button';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const response = await api.post('/users/forgotPassword', { email });
      handleApiResponse(response);
      setMessage('Check your email for reset instructions.');
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
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        {message && <div className="bg-green-100 text-green-700 p-2 rounded text-center">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-center">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
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
