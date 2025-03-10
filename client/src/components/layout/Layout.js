import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Layout - Main application layout with header, sidebar, and footer
 * Renders differently based on authentication status
 */
const Layout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      
      <Flex>
        {/* Show sidebar only when authenticated */}
        {isAuthenticated && (
          <Box
            w="250px"
            minH="calc(100vh - 60px)"
            borderRight="1px"
            borderColor="gray.200"
            display={{ base: 'none', md: 'block' }}
          >
            <Sidebar />
          </Box>
        )}
        
        {/* Main content area */}
        <Box
          flex="1"
          p={4}
          ml={{ base: 0, md: isAuthenticated ? '250px' : 0 }}
          transition="margin-left 0.3s"
          position="relative"
        >
          {/* Outlet renders the current route's component */}
          <Outlet />
        </Box>
      </Flex>
      
      <Footer />
    </Box>
  );
};

export default Layout;