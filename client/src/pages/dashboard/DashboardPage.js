import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Icon,
  Flex,
  Divider,
  useColorModeValue,
  Skeleton,
  Badge,
  Progress
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiList, 
  FiMessageSquare, 
  FiTrendingUp,
  FiClock,
  FiCalendar
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

/**
 * DashboardCard - A card component for dashboard stats and actions
 */
const DashboardCard = ({ title, value, description, icon, color, footer, isLoading }) => {

  if (!isLoading && typeof value === 'object' && value !== null && !React.isValidElement(value)) {
    console.error(`DashboardCard "${title}" received an object as value which cannot be rendered:`, value);
    // Provide a fallback value
    value = JSON.stringify(value).substring(0, 20) + '...';
  }
  const cardBg = useColorModeValue('white', 'gray.700');
  const statColor = useColorModeValue(`${color}.500`, `${color}.300`);
  
  return (
    <Card bg={cardBg} boxShadow="sm" borderRadius="lg" height="100%">
      <CardHeader pb={0}>
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">
            {title}
          </Text>
          <Icon as={icon} boxSize={5} color={statColor} />
        </Flex>
      </CardHeader>
      
      <CardBody>
        {isLoading ? (
          <Skeleton height="40px" width="80%" />
        ) : (
          <Stat>
            <StatNumber fontSize="2xl" fontWeight="bold" color={statColor}>
              {value}
            </StatNumber>
            <StatHelpText fontSize="sm">{description}</StatHelpText>
          </Stat>
        )}
      </CardBody>
      
      {footer && (
        <>
          <Divider />
          <CardFooter pt={2}>
            {footer}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

/**
 * DashboardPage - Main dashboard for the application
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  console.log('API object:', api);
  console.log('User object:', user);
  // Load user stats on mount
  useEffect(() => {
    const loadStats = async () => {
      console.log('Starting to load stats...');
      try {
        console.log('Making API request to /users/usage');
        const response = await api.get('/users/usage');
        console.log('API Response:', response);
        console.log('API Response type:', typeof response);
        console.log('Response.data:', response.data);
        console.log('Response.data.data:', response.data.data);
        
        setStats(response.data.data);
        console.log('Stats set to:', response.data.data);
      } catch (error) {
        console.error('Error loading usage stats:', error);
      } finally {
        setIsLoading(false);
        console.log('Loading completed, isLoading set to false');
      }
    };
    
    
    loadStats();
  }, []);
  
  // Calculate subscription usage percentage
  const getUsagePercentage = () => {
    console.log('getUsagePercentage called with stats:', stats);
    console.log('getUsagePercentage called with user:', user);
    
    if (!stats || !user) {
      console.log('stats or user is null, returning 0');
      return 0;
    }
    
    const limits = {
      'free': 5,
      'starter': 50,
      'growth': 200,
      'scale': 1000
    };
    
    const plan = user.subscription?.plan;
    console.log('User subscription plan:', plan);
    
    const limit = limits[plan] || 5;
    console.log('Usage limit for plan:', limit);
    
    // Ensure contentGenerated is a number
    const contentGenerated = typeof stats.usage?.contentGenerated === 'number' 
      ? stats.usage.contentGenerated 
      : 0;
    console.log('contentGenerated value:', contentGenerated);
    console.log('contentGenerated type:', typeof stats.usage?.contentGenerated);
      
    const percentage = Math.min(Math.round((contentGenerated / limit) * 100), 100);
    console.log('Calculated percentage:', percentage);
    return percentage;
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
  
  return (
    <Box bg={bgColor} minH="calc(100vh - 60px)" py={5}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg">Welcome back, {user?.name?.split(' ')[0] || 'User'}</Heading>
            <Text color="gray.600">Here's an overview of your content generation activities.</Text>
          </Box>
          
          <Button
            as={RouterLink}
            to="/content/create"
            colorScheme="blue"
            leftIcon={<Icon as={FiPlus} />}
          >
            Create Content
          </Button>
        </Flex>
        
        {/* Subscription info */}
        <Card mb={6} bg="white" boxShadow="sm">
          <CardBody>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
              <Box>
                <Flex align="center" mb={2}>
                  <Heading size="md" mr={2}>
                    {user?.subscription?.plan.charAt(0).toUpperCase() + user?.subscription?.plan.slice(1)} Plan
                  </Heading>
                  <Badge colorScheme={user?.subscription?.status === 'active' ? 'green' : 'yellow'}>
                    {user?.subscription?.status}
                  </Badge>
                </Flex>
                
                <Text color="gray.600" fontSize="sm">
                  Renewal date: {formatDate(user?.subscription?.endDate)}
                </Text>
              </Box>
              
              <Box w={{ base: '100%', md: '60%' }}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">Monthly Usage</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {isLoading ? (
                      <Skeleton display="inline-block" height="1em" width="3em" />
                    ) : (
                      `${typeof stats?.usage?.contentGenerated === 'number' ? stats.usage.contentGenerated : 0} / ${user?.subscription?.plan === 'scale' ? 'Unlimited' : getUsagePercentage() + '%'}`
                    )}
                  </Text>
                </Flex>
                <Progress 
                  value={getUsagePercentage()} 
                  colorScheme={getUsagePercentage() > 80 ? 'orange' : 'blue'} 
                  borderRadius="full" 
                  size="sm"
                />
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        {/* Stats grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {console.log('Rendering DashboardCard for Content Generated')}
          {console.log('stats?.usage?.contentGenerated value:', stats?.usage?.contentGenerated)}
          <DashboardCard
            title="Content Generated"
            value={isLoading ? "-" : (typeof stats?.usage?.contentGenerated === 'number' ? stats.usage.contentGenerated : 0)}
            description="Total pieces of content"
            icon={FiMessageSquare}
            color="blue"
            isLoading={isLoading}
            footer={
              <Button 
                as={RouterLink}
                to="/content/history"
                variant="ghost" 
                size="sm" 
                colorScheme="blue" 
                width="full"
                leftIcon={<Icon as={FiList} />}
              >
                View History
              </Button>
            }
          />
          
          {console.log('Rendering DashboardCard for Recent Activity')}
          {console.log('stats?.usage.lastUsed value:', stats?.usage?.lastUsed)}
          <DashboardCard
            title="Recent Activity"
            value={isLoading ? "-" : formatDate(stats?.usage?.lastUsed || new Date())}
            description="Last content generation"
            icon={FiClock}
            color="purple"
            isLoading={isLoading}
            footer={
              <Button 
                as={RouterLink}
                to="/content/create"
                variant="ghost" 
                size="sm" 
                colorScheme="purple" 
                width="full"
                leftIcon={<Icon as={FiPlus} />}
              >
                Create New
              </Button>
            }
          />
          
          {console.log('Rendering DashboardCard for API Calls')}
          {console.log('stats?.usage.apiCalls value:', stats?.usage?.apiCalls)}
          <DashboardCard
            title="API Calls"
            value={isLoading ? "-" : (
              stats?.usage?.apiCalls?.body?.x || "N/A"
            )}
            description="Total API requests"
            icon={FiTrendingUp}
            color="green"
            isLoading={isLoading}
          />
          
          {console.log('Rendering DashboardCard for Subscription')}
          {console.log('user?.subscription:', user?.subscription)}
          <DashboardCard
            title="Subscription"
            value={
              <Flex align="center">
                <Text mr={2}>{user?.subscription?.plan?.charAt(0)?.toUpperCase() + user?.subscription?.plan?.slice(1)}</Text>
                <Badge colorScheme={user?.subscription?.status === 'active' ? 'green' : 'yellow'} fontSize="xs">
                  {user?.subscription?.status}
                </Badge>
              </Flex>
            }
            description={`Renews: ${formatDate(user?.subscription?.endDate)}`}
            icon={FiCalendar}
            color="orange"
            isLoading={isLoading}
            footer={
              <Button 
                variant="ghost" 
                size="sm" 
                colorScheme="orange" 
                width="full"
              >
                Manage Subscription
              </Button>
            }
          />
        </SimpleGrid>
        
        {/* Recent content section */}
        <Box mb={8}>
          <Heading size="md" mb={4}>Recent Content</Heading>
          
          {isLoading ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {[1, 2].map(i => (
                <Card key={i} bg="white" boxShadow="sm">
                  <CardBody>
                    <Skeleton height="20px" width="50%" mb={2} />
                    <Skeleton height="15px" mb={1} />
                    <Skeleton height="15px" width="90%" />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : stats?.recentContent?.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* Recent content cards would go here */}
              <Card bg="white" boxShadow="sm">
                <CardBody>
                  <Text fontSize="sm" color="gray.500" mb={1}>Product Description</Text>
                  <Heading size="sm" mb={2}>Premium Wireless Headphones</Heading>
                  <Text fontSize="sm" noOfLines={2}>
                    Experience unparalleled sound quality with our premium wireless headphones...
                  </Text>
                </CardBody>
                <CardFooter pt={0}>
                  <Button size="sm" variant="outline" colorScheme="blue" as={RouterLink} to="/content/123">
                    View
                  </Button>
                </CardFooter>
              </Card>
              
              <Card bg="white" boxShadow="sm">
                <CardBody>
                  <Text fontSize="sm" color="gray.500" mb={1}>Product Title</Text>
                  <Heading size="sm" mb={2}>Ergonomic Office Chair</Heading>
                  <Text fontSize="sm" noOfLines={2}>
                    Premium Ergonomic Office Chair with Adjustable Lumbar Support...
                  </Text>
                </CardBody>
                <CardFooter pt={0}>
                  <Button size="sm" variant="outline" colorScheme="blue" as={RouterLink} to="/content/456">
                    View
                  </Button>
                </CardFooter>
              </Card>
            </SimpleGrid>
          ) : (
            <Card bg="white" boxShadow="sm">
              <CardBody textAlign="center" py={8}>
                <Text color="gray.500" mb={4}>You haven't generated any content yet.</Text>
                <Button
                  as={RouterLink}
                  to="/content/create"
                  colorScheme="blue"
                  leftIcon={<Icon as={FiPlus} />}
                >
                  Create Your First Content
                </Button>
              </CardBody>
            </Card>
          )}
          
          <Flex justify="center" mt={4}>
            <Button
              as={RouterLink}
              to="/content/history"
              variant="ghost"
              rightIcon={<Icon as={FiList} />}
            >
              View All Content
            </Button>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;