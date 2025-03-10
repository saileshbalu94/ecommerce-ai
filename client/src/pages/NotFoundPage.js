import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Container,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/**
 * NotFoundPage - 404 Page Not Found
 */
const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="container.md" textAlign="center">
        <VStack spacing={6}>
          <Heading size="4xl" fontWeight="bold" color="blue.500">
            404
          </Heading>
          
          <Heading size="xl">Page Not Found</Heading>
          
          <Text fontSize="lg" color="gray.600" maxW="md" mx="auto">
            The page you're looking for doesn't exist or has been moved.
          </Text>
          
          <Box h={8} />
          
          <Button
            as={RouterLink}
            to={isAuthenticated ? '/dashboard' : '/'}
            colorScheme="blue"
            size="lg"
            leftIcon={<Icon as={isAuthenticated ? FiHome : FiArrowLeft} />}
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
          </Button>
          
          {!isAuthenticated && (
            <Button
              as={RouterLink}
              to="/login"
              variant="outline"
              size="lg"
              mt={4}
            >
              Sign In
            </Button>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default NotFoundPage;