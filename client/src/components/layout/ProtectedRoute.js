import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../services/supabase';

/**
 * ProtectedRoute - Component to protect routes from unauthenticated users
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasAuth, setHasAuth] = useState(false);

  // Double check Supabase session directly
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        setHasAuth(!!session);
      } catch (error) {
        console.error('Error checking session:', error);
        setHasAuth(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading || checkingAuth) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Spinner 
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
          <Box mt={4}>Loading...</Box>
        </Box>
      </Center>
    );
  }

  // If not authenticated, redirect to login page with redirect info
  if (!isAuthenticated && !hasAuth) {
    console.log('⚠️ Unauthorized access attempt to:', location.pathname);
    
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;