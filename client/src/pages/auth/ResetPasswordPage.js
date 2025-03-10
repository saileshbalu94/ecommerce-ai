import React, { useState, useEffect } from 'react';
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../services/supabase';

/**
 * ResetPasswordPage - Page for resetting password after clicking link in email
 */
const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  // const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasAuthParams, setHasAuthParams] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  // Form validation state
  const [validation, setValidation] = useState({
    password: { isInvalid: false, errorMessage: '' },
    confirmPassword: { isInvalid: false, errorMessage: '' }
  });
  
  // Check for hash parameters on mount
  useEffect(() => {
    const handleHashParams = async () => {
      try {
        const hashParams = window.location.hash;
        
        if (hashParams && hashParams.includes('access_token')) {
          setHasAuthParams(true);
          
          // Let Supabase handle the hash params
          const { error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('Error processing reset token:', error);
            setError('Invalid or expired reset link. Please request a new one.');
          }
        } else {
          setError('No reset token found. Please request a password reset again.');
        }
      } catch (error) {
        console.error('Error processing hash params:', error);
        setError('An error occurred. Please try again.');
      }
    };
    
    handleHashParams();
  }, []);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      
      // Call reset password from auth context
      const result = await resetPassword(formData.password);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
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
            <Heading size="xl" mb={2}>Reset Password</Heading>
            <Text color="gray.600">Create a new password for your account</Text>
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
              <Box>
                <AlertTitle>Password Reset Complete!</AlertTitle>
                <AlertDescription>
                  Your password has been successfully reset.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            hasAuthParams && (
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl 
                    isRequired 
                    isInvalid={validation.password.isInvalid}
                  >
                    <FormLabel>New Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter a new password"
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
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your new password"
                    />
                    <FormErrorMessage>{validation.confirmPassword.errorMessage}</FormErrorMessage>
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="100%"
                    mt={2}
                    isLoading={isLoading}
                    loadingText="Resetting..."
                  >
                    Reset Password
                  </Button>
                </VStack>
              </form>
            )
          )}
          
          <Text textAlign="center" mt={4}>
            <Link as={RouterLink} to="/login" color="blue.500">
              Return to login
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;