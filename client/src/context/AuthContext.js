import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import supabase from '../services/supabase';
// import api from '../services/api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Load user data from custom profile table (in addition to Supabase auth)
  const loadUserProfile = async (userId) => {
    try {
      // Get user profile from our custom table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Initialize session from Supabase on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Clear any stale state first
        setIsLoading(true);
        setUser(null);
        setIsAuthenticated(false);
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          const { user: authUser } = session;
          
          // Get additional user data from profiles table
          const profile = await loadUserProfile(authUser.id);
          
          // Combine auth user and profile data
          const userData = {
            id: authUser.id,
            email: authUser.email,
            name: profile?.name || authUser.email.split('@')[0],
            subscription: profile?.subscription || {
              plan: 'free',
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            },
            brandVoice: profile?.brand_voice || {
              tone: 'professional',
              style: 'balanced',
              examples: [],
              keywords: [],
              avoidWords: []
            },
            usage: profile?.usage || {
              contentGenerated: 0,
              apiCalls: 0,
              lastUsed: new Date()
            },
            role: profile?.role || 'user',
            createdAt: profile?.created_at || new Date()
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ User session restored successfully');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Clear any partial state on error
        setUser(null);
        setIsAuthenticated(false);
        
        // Clear Supabase session
        await supabase.auth.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });
      
      if (error) throw error;
      
      // Create profile record in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          name: userData.name,
          subscription: {
            plan: 'free',
            status: 'trial',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          },
          brand_voice: {
            tone: 'professional',
            style: 'balanced',
            examples: [],
            keywords: [],
            avoidWords: []
          },
          usage: {
            contentGenerated: 0,
            apiCalls: 0,
            lastUsed: new Date()
          },
          role: 'user'
        }]);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway as the auth part succeeded
      }
      
      toast({
        title: 'Success',
        description: 'Registration successful! Please check your email to confirm your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      console.log('✅ Registration successful');
      
      // For email confirmation flow, we might not redirect immediately
      // navigate('/login');
      return { success: true };
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      toast({
        title: 'Registration Failed',
        description: error.message || 'Registration failed. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) throw error;
      
      // Get user profile
      const profile = await loadUserProfile(data.user.id);
      
      // Update last login time
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          'usage.lastUsed': new Date()
        })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.error('Error updating last login:', updateError);
        // Continue anyway as login succeeded
      }
      
      toast({
        title: 'Success',
        description: 'Login successful!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      console.log('✅ Login successful');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear any local storage or cookies
      localStorage.removeItem('supabase.auth.token');
      
      // Redirect to login
      navigate('/login');
      
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: error.message || 'Failed to logout',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          email: profileData.email,
          updated_at: new Date()
        })
        .eq('id', user.id);
      
      if (error) throw error;

      // Update email in Auth if it changed
      if (profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        
        if (emailError) throw emailError;
      }
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        name: profileData.name,
        email: profileData.email
      }));
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      console.log('✅ Profile update successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { 
        success: false, 
        error: error.message || 'Update failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      setIsLoading(true);
      
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Password updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      console.log('✅ Password update successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Password update error:', error);
      
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { 
        success: false, 
        error: error.message || 'Update failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);
      
      // Send password reset email with Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Password reset instructions sent to your email.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      console.log('✅ Forgot password request successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to process request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { 
        success: false, 
        error: error.message || 'Request failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password (after clicking email link)
  const resetPassword = async (newPassword) => {
    try {
      setIsLoading(true);
      
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Password reset successful! You can now login with your new password.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      console.log('✅ Password reset successful');
      navigate('/login');
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { 
        success: false, 
        error: error.message || 'Reset failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Update brand voice
  const updateBrandVoice = async (brandVoiceData) => {
    try {
      setIsLoading(true);
      
      // Update brand voice in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          brand_voice: brandVoiceData
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        brandVoice: brandVoiceData
      }));
      
      toast({
        title: 'Success',
        description: 'Brand voice settings updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      console.log('✅ Brand voice update successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Brand voice update error:', error);
      
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update brand voice settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { 
        success: false, 
        error: error.message || 'Update failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Return context value
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        updateBrandVoice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;