import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  useDisclosure,
  useColorMode,
  useBreakpointValue,
  HStack,
  Link
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  MoonIcon, 
  SunIcon 
} from '@chakra-ui/icons';

import { useAuth } from '../../context/AuthContext';
import MobileDrawer from './MobileDrawer';

/**
 * Header - Main application header with navigation and user menu
 */
const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure(); // For mobile menu
  const { colorMode, toggleColorMode } = useColorMode();
  // const navigate = useNavigate();
  
  // Responsive font size
  const fontSize = useBreakpointValue({ base: 'md', md: 'lg' });
  
  return (
    <Box 
      as="header" 
      bg="white" 
      boxShadow="sm" 
      position="sticky" 
      top={0} 
      zIndex={10}
    >
      <Flex 
        h={16} 
        alignItems="center" 
        justifyContent="space-between" 
        maxW="container.xl" 
        mx="auto" 
        px={4}
      >
        {/* Logo and site name */}
        <Flex alignItems="center">
          <Text
            as={RouterLink}
            to="/"
            fontSize="2xl"
            fontWeight="bold"
            color="blue.500"
          >
            eContent AI
          </Text>
        </Flex>

        {/* Desktop Navigation */}
        <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
          <Link as={RouterLink} to="/" fontSize={fontSize}>
            Home
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link as={RouterLink} to="/dashboard" fontSize={fontSize}>
                Dashboard
              </Link>
              <Link as={RouterLink} to="/content/create" fontSize={fontSize}>
                Create Content
              </Link>
            </>
          ) : (
            <>
              <Link as={RouterLink} to="/login" fontSize={fontSize}>
                Login
              </Link>
              <Link as={RouterLink} to="/register" fontSize={fontSize}>
                Register
              </Link>
            </>
          )}
        </HStack>

        {/* User menu and theme toggle */}
        <Flex alignItems="center">
          {/* Theme toggle */}
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
            onClick={toggleColorMode}
            mr={3}
          />

          {/* User menu (only when authenticated) */}
          {isAuthenticated && (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar 
                  size="sm" 
                  name={user?.name || 'User'} 
                  src={user?.avatar}
                />
              </MenuButton>
              <MenuList>
                <Text px={4} py={2} fontSize="sm" fontWeight="bold">
                  {user?.name || 'User'}
                </Text>
                <Text px={4} pb={2} fontSize="xs" color="gray.500">
                  {user?.email || ''}
                </Text>
                <MenuDivider />
                <MenuItem as={RouterLink} to="/profile">
                  Profile
                </MenuItem>
                <MenuItem as={RouterLink} to="/brand-voice">
                  Brand Voice
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={logout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}

          {/* Mobile menu button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="ghost"
            aria-label="Toggle Navigation"
            ml={2}
          />
        </Flex>
      </Flex>

      {/* Mobile navigation drawer */}
      <MobileDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Header;