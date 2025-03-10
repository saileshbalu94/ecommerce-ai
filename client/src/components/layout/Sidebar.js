import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  Flex,
  Text,
  Icon,
  Divider,
  Badge
} from '@chakra-ui/react';
import {
  FiHome,
  FiPlus,
  FiList,
  FiUser,
  FiMessageSquare
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';

/**
 * NavItem - A single navigation item in the sidebar
 * @param {Object} props - Component props
 */
const NavItem = ({ icon, children, to, badge, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Box
      as={RouterLink}
      to={to}
      display="block"
      w="100%"
      py={2}
      px={4}
      borderRadius="md"
      transition="all 0.2s"
      fontWeight={isActive ? "bold" : "normal"}
      color={isActive ? "blue.600" : "gray.600"}
      bg={isActive ? "blue.50" : "transparent"}
      _hover={{
        bg: isActive ? "blue.50" : "gray.100",
        color: isActive ? "blue.600" : "gray.800"
      }}
      {...rest}
    >
      <Flex align="center">
        <Icon as={icon} mr={3} fontSize="lg" />
        <Text>{children}</Text>
        {badge && (
          <Badge ml="auto" colorScheme="blue" variant="solid" borderRadius="full">
            {badge}
          </Badge>
        )}
      </Flex>
    </Box>
  );
};

/**
 * Sidebar - Left sidebar navigation for authenticated users
 */
const Sidebar = () => {
  const { user } = useAuth();
  const subscription = user?.subscription?.plan || 'free';
  
  return (
    <Box as="nav" h="full" pt={5} bg="white">
      {/* Subscription label */}
      <Flex px={4} mb={6} alignItems="center" justifyContent="center">
        <Badge 
          colorScheme={
            subscription === 'scale' ? 'purple' :
            subscription === 'growth' ? 'green' :
            subscription === 'starter' ? 'blue' : 'gray'
          }
          p={2}
          borderRadius="md"
          fontSize="sm"
        >
          {subscription.charAt(0).toUpperCase() + subscription.slice(1)} Plan
        </Badge>
      </Flex>
      
      <VStack spacing={1} align="stretch">
        <NavItem icon={FiHome} to="/dashboard">
          Dashboard
        </NavItem>
        
        <Divider my={2} />
        
        <Text px={4} fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
          CONTENT
        </Text>
        <NavItem icon={FiPlus} to="/content/create">
          Create Content
        </NavItem>
        <NavItem icon={FiList} to="/content/history">
          Content History
        </NavItem>
        
        <Divider my={2} />
        
        <Text px={4} fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
          SETTINGS
        </Text>
        <NavItem icon={FiUser} to="/profile">
          Profile
        </NavItem>
        <NavItem icon={FiMessageSquare} to="/brand-voice">
          Brand Voice
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;