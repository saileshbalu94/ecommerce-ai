import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  Badge,
  useColorModeValue,
  useToast,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Card,
  CardHeader,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  FiHome,
  FiChevronRight,
  FiUser,
  FiSave,
  FiEye,
  FiEyeOff,
  FiLock,
  FiCreditCard,
  FiClipboard,
  FiPackage
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

/**
 * ProfilePage - User profile and account settings
 */
const ProfilePage = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Show/hide password state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  
  // Derived data for subscription
  const subscriptionEndDate = user?.subscription?.endDate
    ? new Date(user.subscription.endDate)
    : null;
  
  const daysRemaining = subscriptionEndDate
    ? Math.max(0, Math.floor((subscriptionEndDate - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  const subscriptionStatusColors = {
    'active': 'green',
    'trial': 'yellow',
    'inactive': 'red'
  };
  
  // Calculate usage percentage
  const getUsagePercentage = () => {
    if (!user) return 0;
    
    const limits = {
      'free': 5,
      'starter': 50,
      'growth': 200,
      'scale': 1000
    };
    
    const limit = limits[user.subscription?.plan] || 5;
    return Math.min(Math.round((user.usage?.contentGenerated / limit) * 100), 100);
  };
  
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = { ...errors };
    let isValid = true;
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = { ...errors };
    let isValid = true;
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Save profile changes
  const saveProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      setIsProfileSaving(true);
      
      const result = await updateProfile({
        name: profileData.name,
        // Note: Email updates might require verification in a real app
        // We're keeping it simple here
        email: profileData.email
      });
      
      if (result.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile information has been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Update Failed',
          description: result.error || 'Failed to update profile. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProfileSaving(false);
    }
  };
  
  // Change password
  const changePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setIsPasswordSaving(true);
      
      const result = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Update Failed',
          description: result.error || 'Failed to update password. Please check your current password.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };
  
  return (
    <Box bg={bgColor} minH="calc(100vh - 60px)" py={5}>
      <Container maxW="container.xl">
        {/* Breadcrumb navigation */}
        <Breadcrumb
          spacing="8px"
          separator={<Icon as={FiChevronRight} color="gray.500" />}
          mb={6}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/dashboard">
              <Icon as={FiHome} mr={1} />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <Icon as={FiUser} mr={1} />
              Profile
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        {/* Page heading */}
        <Heading as="h1" size="xl" mb={2}>
          My Profile
        </Heading>
        <Text color="gray.600" mb={6}>
          Manage your account settings and subscription
        </Text>
        
        {/* Account stats overview */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card>
            <CardHeader pb={1}>
              <Stat>
                <StatLabel>Subscription Plan</StatLabel>
                <Flex align="center" mt={1}>
                  <StatNumber mr={2}>
                    {user?.subscription?.plan
                      ? user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)
                      : 'Free'}
                  </StatNumber>
                  <Badge colorScheme={subscriptionStatusColors[user?.subscription?.status] || 'gray'}>
                    {user?.subscription?.status || 'inactive'}
                  </Badge>
                </Flex>
                {daysRemaining !== undefined && (
                  <StatHelpText>
                    {daysRemaining > 0
                      ? `${daysRemaining} days remaining`
                      : 'Expired'}
                  </StatHelpText>
                )}
              </Stat>
            </CardHeader>
            <CardBody pt={0}>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Icon as={FiCreditCard} />}
                as={RouterLink}
                to="#"
                mt={2}
              >
                Manage Subscription
              </Button>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader pb={1}>
              <Stat>
                <StatLabel>Content Generated</StatLabel>
                <StatNumber>
                  {user?.usage?.contentGenerated || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {/* This would ideally be calculated from real data */}
                  23% increase this month
                </StatHelpText>
              </Stat>
            </CardHeader>
            <CardBody pt={0}>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<Icon as={FiClipboard} />}
                as={RouterLink}
                to="/content/history"
                mt={2}
              >
                View Content History
              </Button>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader pb={1}>
              <Stat>
                <StatLabel>Usage</StatLabel>
                <StatNumber>
                  {getUsagePercentage()}%
                </StatNumber>
                <StatHelpText>
                  of your monthly limit
                </StatHelpText>
              </Stat>
            </CardHeader>
            <CardBody pt={0}>
              <Progress
                value={getUsagePercentage()}
                colorScheme={getUsagePercentage() > 80 ? "orange" : "blue"}
                size="sm"
                borderRadius="full"
                mb={2}
              />
              <Text fontSize="xs">
                {user?.usage?.contentGenerated || 0} / 
                {user?.subscription?.plan === 'scale' 
                  ? 'Unlimited' 
                  : '50'} items
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        {/* Profile Information */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
          <Box 
            bg={cardBg} 
            p={6} 
            borderRadius="md" 
            boxShadow="sm"
          >
            <Heading size="md" mb={4}>
              <Flex align="center">
                <Icon as={FiUser} mr={2} />
                Profile Information
              </Flex>
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Your full name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email Address</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Your email address"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Member Since</FormLabel>
                <Input
                  value={formatDate(user?.createdAt)}
                  readOnly
                  isDisabled
                />
              </FormControl>
              
              <Box>
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={FiSave} />}
                  onClick={saveProfile}
                  isLoading={isProfileSaving}
                  loadingText="Saving..."
                  mt={2}
                >
                  Save Changes
                </Button>
              </Box>
            </VStack>
          </Box>
          
          {/* Password Change */}
          <Box 
            bg={cardBg} 
            p={6} 
            borderRadius="md" 
            boxShadow="sm"
          >
            <Heading size="md" mb={4}>
              <Flex align="center">
                <Icon as={FiLock} mr={2} />
                Change Password
              </Flex>
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.currentPassword}>
                <FormLabel>Current Password</FormLabel>
                <InputGroup>
                  <Input
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      icon={showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.newPassword}>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirm New Password</FormLabel>
                <InputGroup>
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              
              <Box>
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={FiSave} />}
                  onClick={changePassword}
                  isLoading={isPasswordSaving}
                  loadingText="Updating..."
                  mt={2}
                >
                  Update Password
                </Button>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
        
        {/* Subscription Details */}
        <Box 
          bg={cardBg} 
          p={6} 
          borderRadius="md" 
          boxShadow="sm"
          mb={8}
        >
          <Heading size="md" mb={4}>
            <Flex align="center">
              <Icon as={FiPackage} mr={2} />
              Subscription Details
            </Flex>
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Box>
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Plan:</Text>
                  <Text>
                    {user?.subscription?.plan
                      ? user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)
                      : 'Free'}
                  </Text>
                </Flex>
                
                <Flex justify="space-between">
                  <Text fontWeight="bold">Status:</Text>
                  <Badge colorScheme={subscriptionStatusColors[user?.subscription?.status] || 'gray'}>
                    {user?.subscription?.status || 'inactive'}
                  </Badge>
                </Flex>
                
                <Flex justify="space-between">
                  <Text fontWeight="bold">Renewal Date:</Text>
                  <Text>{formatDate(user?.subscription?.endDate)}</Text>
                </Flex>
                
                <Flex justify="space-between">
                  <Text fontWeight="bold">Monthly Content Limit:</Text>
                  <Text>
                    {user?.subscription?.plan === 'free' && '5 items'}
                    {user?.subscription?.plan === 'starter' && '50 items'}
                    {user?.subscription?.plan === 'growth' && '200 items'}
                    {user?.subscription?.plan === 'scale' && 'Unlimited'}
                    {!user?.subscription?.plan && '5 items'}
                  </Text>
                </Flex>
              </VStack>
              
              <Button
                mt={6}
                colorScheme="purple"
                as={RouterLink}
                to="#"
              >
                Upgrade Plan
              </Button>
            </Box>
            
            <Box>
              {user?.subscription?.status === 'trial' && (
                <Alert
                  status="info"
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  borderRadius="md"
                  height="100%"
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    Trial Period
                  </AlertTitle>
                  <AlertDescription maxWidth="sm">
                    You are currently in a trial period that will expire in {daysRemaining} days. 
                    Upgrade to a paid plan to continue using all features.
                  </AlertDescription>
                </Alert>
              )}
              
              {user?.subscription?.status === 'active' && (
                <Alert
                  status="success"
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  borderRadius="md"
                  height="100%"
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    Active Subscription
                  </AlertTitle>
                  <AlertDescription maxWidth="sm">
                    Your subscription is active and will renew on {formatDate(user?.subscription?.endDate)}.
                  </AlertDescription>
                </Alert>
              )}
              
              {(!user?.subscription?.status || user?.subscription?.status === 'inactive') && (
                <Alert
                  status="warning"
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  borderRadius="md"
                  height="100%"
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    Inactive Subscription
                  </AlertTitle>
                  <AlertDescription maxWidth="sm">
                    Your subscription is inactive. Upgrade to a paid plan to access all features.
                  </AlertDescription>
                </Alert>
              )}
            </Box>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfilePage;