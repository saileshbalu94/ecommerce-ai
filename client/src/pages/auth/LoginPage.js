import React, { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
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
  HStack,
  Checkbox,
  FormErrorMessage,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../services/supabase';

/**
 * LoginPage - User login page
 */
const LoginPage = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // Form validation state
  const [validation, setValidation] = useState({
    email: { isInvalid: false, errorMessage: '' },
    password: { isInvalid: false, errorMessage: '' }
  });
  
  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from || '/dashboard';
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user types
    if (validation[name]?.isInvalid) {
      setValidation(prev => ({
        ...prev,
        [name]: { isInvalid: false, errorMessage: '' }
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newValidation = { ...validation };
    
    // Validate email
    if (!formData.email.trim()) {
      newValidation.email = {
        isInvalid: true,
        errorMessage: 'Email is required'
      };
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newValidation.email = {
        isInvalid: true,
        errorMessage: 'Please enter a valid email'
      };
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      newValidation.password = {
        isInvalid: true,
        errorMessage: 'Password is required'
      };
      isValid = false;
    }
    
    setValidation(newValidation);
    return isValid;
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
      
      // Call login from auth context
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        // Redirect to intended destination
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add this function to clear any stale sessions
  const clearSession = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      window.location.reload(); // Force a full page reload
    } catch (error) {
      console.error('Failed to clear session:', error);
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
            <Heading size="xl" mb={2}>Welcome Back</Heading>
            <Text color="gray.600">Sign in to your account</Text>
          </Box>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          {location.state?.from && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              Please login to access that page.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl 
                isRequired 
                isInvalid={validation.email.isInvalid}
              >
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
                <FormErrorMessage>{validation.email.errorMessage}</FormErrorMessage>
              </FormControl>
              
              <FormControl 
                isRequired 
                isInvalid={validation.password.isInvalid}
              >
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{validation.password.errorMessage}</FormErrorMessage>
              </FormControl>
              
              <HStack justify="space-between" w="100%">
                <Checkbox
                  name="rememberMe"
                  isChecked={formData.rememberMe}
                  onChange={handleChange}
                >
                  Remember me
                </Checkbox>
                
                <Link 
                  as={RouterLink} 
                  to="/forgot-password" 
                  color="blue.500" 
                  fontSize="sm"
                >
                  Forgot password?
                </Link>
              </HStack>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="100%"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </form>
          
          <Button
            variant="link"
            size="sm"
            onClick={clearSession}
            isLoading={isLoading}
            mt={4}
          >
            Having trouble? Click here to clear session
          </Button>
          
          <Divider />
          
          <Text textAlign="center">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="blue.500">
              Sign up
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default LoginPage;