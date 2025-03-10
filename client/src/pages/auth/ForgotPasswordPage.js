import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
  FormErrorMessage,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

/**
 * ForgotPasswordPage - Page for requesting password reset
 */
const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Validation state
  const [isInvalid, setIsInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear validation errors when user types
    if (isInvalid) {
      setIsInvalid(false);
      setErrorMessage('');
    }
  };
  
  // Validate form
  const validateForm = () => {
    if (!email.trim()) {
      setIsInvalid(true);
      setErrorMessage('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setIsInvalid(true);
      setErrorMessage('Please enter a valid email');
      return false;
    }
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call forgot password from auth context
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to process request. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Container maxW="md" py={12}>
      <Box 
        bg={bgColor} 
        p={8} 
        borderRadius="lg" 
        boxShadow="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={2}>Forgot Password</Heading>
            <Text color="gray.600">Enter your email to receive a password reset link</Text>
          </Box>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          {success ? (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Password reset link has been sent to your email. Please check your inbox.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl 
                  isRequired 
                  isInvalid={isInvalid}
                >
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                  <FormErrorMessage>{errorMessage}</FormErrorMessage>
                </FormControl>
                
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  mt={2}
                  isLoading={isLoading}
                  loadingText="Sending..."
                >
                  Send Reset Link
                </Button>
              </VStack>
            </form>
          )}
          
          <Text textAlign="center" mt={4}>
            Remember your password?{' '}
            <Link as={RouterLink} to="/login" color="blue.500">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;