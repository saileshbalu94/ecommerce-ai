import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Link,
  Button,
  Divider,
  Text,
  Flex
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

/**
 * MobileDrawer - Mobile navigation drawer
 * @param {Boolean} isOpen - Whether drawer is open
 * @param {Function} onClose - Function to close drawer
 */
const MobileDrawer = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();

  // Handle logout
  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {isAuthenticated ? 'Menu' : 'Navigation'}
        </DrawerHeader>
        
        <DrawerBody py={4}>
          {isAuthenticated ? (
            <>
              {/* User info */}
              <Flex direction="column" mb={6} align="center">
                <Text fontWeight="bold">{user?.name || 'User'}</Text>
                <Text fontSize="sm" color="gray.500">
                  {user?.email || ''}
                </Text>
              </Flex>
              
              <Divider mb={4} />
              
              {/* Authenticated navigation links */}
              <VStack spacing={3} align="stretch">
                <Link as={RouterLink} to="/" onClick={onClose}>
                  Home
                </Link>
                <Link as={RouterLink} to="/dashboard" onClick={onClose}>
                  Dashboard
                </Link>
                <Link as={RouterLink} to="/content/create" onClick={onClose}>
                  Create Content
                </Link>
                <Link as={RouterLink} to="/content/history" onClick={onClose}>
                  Content History
                </Link>
                <Link as={RouterLink} to="/profile" onClick={onClose}>
                  Profile
                </Link>
                <Link as={RouterLink} to="/brand-voice" onClick={onClose}>
                  Brand Voice
                </Link>
                
                <Divider my={2} />
                
                <Button 
                  colorScheme="red" 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </VStack>
            </>
          ) : (
            <>
              {/* Unauthenticated navigation links */}
              <VStack spacing={3} align="stretch">
                <Link as={RouterLink} to="/" onClick={onClose}>
                  Home
                </Link>
                <Link as={RouterLink} to="/login" onClick={onClose}>
                  Login
                </Link>
                <Link as={RouterLink} to="/register" onClick={onClose}>
                  Register
                </Link>
              </VStack>
            </>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;