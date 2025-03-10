import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

import ContentGenerator from '../../components/content/ContentGenerator';
import { useAuth } from '../../context/AuthContext';

/**
 * CreateContentPage - Page for creating new content
 */
const CreateContentPage = () => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const subscriptionPlan = user?.subscription?.plan || 'free';
  
  // Calculate usage limits based on subscription
  const contentLimit = {
    'free': 5,
    'starter': 50,
    'growth': 200,
    'scale': 1000
  }[subscriptionPlan] || 5;
  
  // Check if user is approaching content limit
  const isApproachingLimit = user?.usage?.contentGenerated > contentLimit * 0.8;
  
  return (
    <Box bg={bgColor} minH="calc(100vh - 60px)">
      <Container maxW="container.xl" py={5}>
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
            <BreadcrumbLink>Create Content</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        {/* Page heading */}
        <Heading as="h1" size="xl" mb={2}>
          Create Content
        </Heading>
        <Text color="gray.600" mb={6}>
          Fill in the product details to generate high-converting product descriptions and titles.
        </Text>
        
        {/* Usage warning if approaching limits */}
        {isApproachingLimit && (
          <Alert status="warning" mb={6} borderRadius="md">
            <AlertIcon />
            <AlertTitle>Approaching Usage Limit!</AlertTitle>
            <AlertDescription>
              You've used {user?.usage?.contentGenerated} out of your {contentLimit} content generations this month.
              {subscriptionPlan !== 'scale' && (
                ` Consider upgrading your plan for higher limits.`
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Content generator component */}
        <ContentGenerator />
      </Container>
    </Box>
  );
};

export default CreateContentPage;