import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function Login() {
  const { signIn, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      const err = signInError as Error;
      setError(err.message || "Login failed");
    } else {
      // Redirect and reload to initialize auth session
      window.location.href = "/projects";
    }
  };

  if (user) {
    // If already authenticated, redirect and reload
    window.location.href = "/projects";
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <div className="text-right mt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {/* Or Google OAuth */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 mb-2">or</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href =
                "https://project-management-tool-2ws0.onrender.com/api/v1/users/auth/google";
            }}
          >
            Sign in with Google
          </Button>
        </div>
      </form>
    </div>
  );
}
