import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  Alert,
  AlertIcon,
  Checkbox
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';

/**
 * RegisterPage - User registration page
 */
const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  // Form validation state
  const [validation, setValidation] = useState({
    name: { isInvalid: false, errorMessage: '' },
    email: { isInvalid: false, errorMessage: '' },
    password: { isInvalid: false, errorMessage: '' },
    confirmPassword: { isInvalid: false, errorMessage: '' },
    acceptTerms: { isInvalid: false, errorMessage: '' }
  });
  
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
    
    // Validate name
    if (!formData.name.trim()) {
      newValidation.name = {
        isInvalid: true,
        errorMessage: 'Name is required'
      };
      isValid = false;
    }
    
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
    } else if (formData.password.length < 6) {
      newValidation.password = {
        isInvalid: true,
        errorMessage: 'Password must be at least 6 characters'
      };
      isValid = false;
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newValidation.confirmPassword = {
        isInvalid: true,
        errorMessage: 'Passwords do not match'
      };
      isValid = false;
    }
    
    // Validate terms acceptance
    if (!formData.acceptTerms) {
      newValidation.acceptTerms = {
        isInvalid: true,
        errorMessage: 'You must accept the terms and conditions'
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
      
      // Call register from auth context
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        // Navigate to dashboard on successful registration
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
            <Heading size="xl" mb={2}>Create Account</Heading>
            <Text color="gray.600">Sign up to get started</Text>
          </Box>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl 
                isRequired 
                isInvalid={validation.name.isInvalid}
              >
                <FormLabel>Full Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
                <FormErrorMessage>{validation.name.errorMessage}</FormErrorMessage>
              </FormControl>
              
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
                    placeholder="Create a password"
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
              
              <FormControl 
                isRequired 
                isInvalid={validation.confirmPassword.isInvalid}
              >
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                <FormErrorMessage>{validation.confirmPassword.errorMessage}</FormErrorMessage>
              </FormControl>
              
              <FormControl 
                isRequired 
                isInvalid={validation.acceptTerms.isInvalid}
              >
                <Checkbox
                  name="acceptTerms"
                  isChecked={formData.acceptTerms}
                  onChange={handleChange}
                >
                  I accept the Terms of Service and Privacy Policy
                </Checkbox>
                <FormErrorMessage>{validation.acceptTerms.errorMessage}</FormErrorMessage>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="100%"
                mt={2}
                isLoading={isLoading}
                loadingText="Creating account..."
              >
                Sign Up
              </Button>
            </VStack>
          </form>
          
          <Divider />
          
          <Text textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="blue.500">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default RegisterPage;