import { useEffect, useState } from 'react';
import { AuthService } from '../services';
import { ApiUser, LoginRequest, SignUpRequest } from '../types';
import { setAuthToken } from '../lib/api';

interface ApiAuthState {
  user: ApiUser | null;
  loading: boolean;
  error: string | null;
}

export function useApiAuth() {
  const [state, setState] = useState<ApiAuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check if user is already authenticated (token in localStorage)
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          setAuthToken(token);
          const response = await AuthService.getCurrentUser();
          setState({
            user: response.data?.user || null,
            loading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        setAuthToken(null);
        setState({
          user: null,
          loading: false,
          error: 'Authentication check failed',
        });
      }
    };

    checkAuth();
  }, []);

  const signIn = async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await AuthService.signIn(credentials);
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      setState({
        user: response.data.user,
        loading: false,
        error: null,
      });
      return { success: true, data: response };
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
      return { success: false, error };
    }
  };

  const signUp = async (userData: SignUpRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await AuthService.signUp(userData);
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      setState({
        user: response.data.user,
        loading: false,
        error: null,
      });
      return { success: true, data: response };
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      return { success: false, error };
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await AuthService.signOut();
      localStorage.removeItem('auth_token');
      setState({
        user: null,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error: unknown) {
      // Clear local state even if API call fails
      localStorage.removeItem('auth_token');
      setState({
        user: null,
        loading: false,
        error: null,
      });
      return { success: false, error };
    }
  };

  const updateProfile = async (data: FormData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await AuthService.updateProfile(data);
      setState(prev => ({
        ...prev,
        user: response.data?.user || prev.user,
        loading: false,
        error: null,
      }));
      return { success: true, data: response };
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      }));
      return { success: false, error };
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
    isAuthenticated: !!state.user,
  };
}

export default useApiAuth;
